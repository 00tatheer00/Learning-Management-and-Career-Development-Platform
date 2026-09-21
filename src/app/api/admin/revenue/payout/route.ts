import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRead, requireAdminWrite } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { sendTrainerSalaryEmail } from "@/lib/notifications/trainer-salary-email";

// GET /api/admin/revenue/payout - Fetch payout records & trainer contacts
export async function GET(request: Request) {
  const adminOrRes = await requireAdminRead(request);
  if (adminOrRes instanceof NextResponse) return adminOrRes;

  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get("phase");
    const period = searchParams.get("period");
    const programSlug = searchParams.get("programSlug");

    const where: Record<string, unknown> = {};
    if (phase && phase !== "all") where.phase = phase;
    if (period) where.period = period;
    if (programSlug) where.programSlug = programSlug;

    const [payouts, trainerUsers] = await Promise.all([
      prisma.trainerPayout.findMany({
        where,
        orderBy: { paidAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "trainer" },
        select: { id: true, name: true, email: true, programSlug: true },
      }),
    ]);

    // Build trainer email map by programSlug
    const trainerContactMap: Record<string, { email: string; name: string }> = {};
    for (const u of trainerUsers) {
      if (u.programSlug) {
        trainerContactMap[u.programSlug] = { email: u.email, name: u.name };
      }
    }

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          payouts,
          trainerContacts: trainerContactMap,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching trainer payouts:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to fetch payouts" }),
      { status: 500 }
    );
  }
}

// POST /api/admin/revenue/payout - Mark trainer payout as paid with full record details & email
export async function POST(request: Request) {
  const adminOrRes = await requireAdminWrite(request);
  if (adminOrRes instanceof NextResponse) return adminOrRes;
  const admin = adminOrRes;

  try {
    const body = await request.json();
    const {
      programSlug,
      phase,
      period = "all",
      amount = 0,
      studentCount = 0,
      trainerName,
      trainerEmail: customTrainerEmail,
      paidBy: customPaidBy,
      paymentAccount,
      recipientAccount,
      transactionRef,
      receiptUrl,
      receiptPublicId,
      paidAt,
      note,
      sendEmail = true,
      courseTitle,
      phaseLabel,
      periodLabel,
    } = body;

    if (!programSlug || !phase) {
      return NextResponse.json(
        createApiResponse(false, { error: "programSlug and phase are required" }),
        { status: 400 }
      );
    }

    const paidBy = customPaidBy?.trim() || admin.name || admin.email || "Admin";
    const paymentDate = paidAt ? new Date(paidAt) : new Date();

    // Auto-resolve trainer email if not explicitly provided
    let resolvedEmail = customTrainerEmail?.trim() || null;
    if (!resolvedEmail) {
      const dbTrainer = await prisma.user.findFirst({
        where: { role: "trainer", programSlug },
        select: { email: true, name: true },
      });
      if (dbTrainer?.email) {
        resolvedEmail = dbTrainer.email;
      }
    }

    // Upsert payout record by composite unique key
    const payout = await prisma.trainerPayout.upsert({
      where: {
        programSlug_phase_period: {
          programSlug,
          phase,
          period,
        },
      },
      update: {
        amount: Number(amount) || 0,
        studentCount: Number(studentCount) || 0,
        trainerName: trainerName || null,
        trainerEmail: resolvedEmail,
        paidAt: paymentDate,
        paidBy,
        paymentAccount: paymentAccount?.trim() || null,
        recipientAccount: recipientAccount?.trim() || null,
        transactionRef: transactionRef?.trim() || null,
        receiptUrl: receiptUrl?.trim() || null,
        receiptPublicId: receiptPublicId?.trim() || null,
        note: note?.trim() || null,
      },
      create: {
        id: `payout_${crypto.randomUUID()}`,
        programSlug,
        phase,
        period,
        amount: Number(amount) || 0,
        studentCount: Number(studentCount) || 0,
        trainerName: trainerName || null,
        trainerEmail: resolvedEmail,
        paidAt: paymentDate,
        paidBy,
        paymentAccount: paymentAccount?.trim() || null,
        recipientAccount: recipientAccount?.trim() || null,
        transactionRef: transactionRef?.trim() || null,
        receiptUrl: receiptUrl?.trim() || null,
        receiptPublicId: receiptPublicId?.trim() || null,
        note: note?.trim() || null,
      },
    });

    // Send email notification to trainer if requested & email is available
    let emailStatus: { sent: boolean; error?: string } = { sent: false };
    if (sendEmail && resolvedEmail) {
      try {
        emailStatus = await sendTrainerSalaryEmail({
          to: resolvedEmail,
          trainerName: trainerName || payout.trainerName || "Trainer",
          courseTitle: courseTitle || programSlug,
          phaseLabel: phaseLabel || phase,
          periodLabel: periodLabel || period,
          studentCount: Number(studentCount) || 0,
          amount: Number(amount) || 0,
          paidBy,
          paymentAccount: paymentAccount?.trim() || null,
          recipientAccount: recipientAccount?.trim() || null,
          transactionRef: transactionRef?.trim() || null,
          receiptUrl: receiptUrl?.trim() || null,
          paidAt: paymentDate,
          note: note?.trim() || null,
        });

        if (emailStatus.sent) {
          await prisma.trainerPayout.update({
            where: { id: payout.id },
            data: { emailSent: true, emailSentAt: new Date() },
          });
          payout.emailSent = true;
          payout.emailSentAt = new Date();
        }
      } catch (emailErr) {
        console.error("Trainer salary email dispatch failed:", emailErr);
        emailStatus = {
          sent: false,
          error: emailErr instanceof Error ? emailErr.message : "Email dispatch failed",
        };
      }
    }

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          payout,
          emailStatus,
        },
      })
    );
  } catch (error) {
    console.error("Error saving trainer payout:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to save payout" }),
      { status: 500 }
    );
  }
}

// DELETE /api/admin/revenue/payout - Revert / delete a payout record
export async function DELETE(request: Request) {
  const adminOrRes = await requireAdminWrite(request);
  if (adminOrRes instanceof NextResponse) return adminOrRes;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const programSlug = searchParams.get("programSlug");
    const phase = searchParams.get("phase");
    const period = searchParams.get("period") || "all";

    if (id) {
      await prisma.trainerPayout.delete({
        where: { id },
      });
      return NextResponse.json(createApiResponse(true, { message: "Payout removed" }));
    }

    if (programSlug && phase) {
      await prisma.trainerPayout.delete({
        where: {
          programSlug_phase_period: {
            programSlug,
            phase,
            period,
          },
        },
      });
      return NextResponse.json(createApiResponse(true, { message: "Payout removed" }));
    }

    return NextResponse.json(
      createApiResponse(false, { error: "Either id or programSlug and phase are required" }),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting trainer payout:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to delete payout" }),
      { status: 500 }
    );
  }
}
