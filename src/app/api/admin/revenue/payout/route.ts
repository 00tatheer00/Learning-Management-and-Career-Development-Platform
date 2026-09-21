import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRead, requireAdminWrite } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";

// GET /api/admin/revenue/payout - Fetch payout records
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

    const payouts = await prisma.trainerPayout.findMany({
      where,
      orderBy: { paidAt: "desc" },
    });

    return NextResponse.json(createApiResponse(true, { data: payouts }));
  } catch (error) {
    console.error("Error fetching trainer payouts:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to fetch payouts" }),
      { status: 500 }
    );
  }
}

// POST /api/admin/revenue/payout - Mark trainer payout as paid
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
      note,
    } = body;

    if (!programSlug || !phase) {
      return NextResponse.json(
        createApiResponse(false, { error: "programSlug and phase are required" }),
        { status: 400 }
      );
    }

    const paidBy = admin.name || admin.email || "Admin";

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
        paidAt: new Date(),
        paidBy,
        note: note || null,
      },
      create: {
        id: `payout_${crypto.randomUUID()}`,
        programSlug,
        phase,
        period,
        amount: Number(amount) || 0,
        studentCount: Number(studentCount) || 0,
        trainerName: trainerName || null,
        paidAt: new Date(),
        paidBy,
        note: note || null,
      },
    });

    return NextResponse.json(createApiResponse(true, { data: payout }));
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
