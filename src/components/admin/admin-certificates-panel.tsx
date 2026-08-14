"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Certificate,
  Sparkle,
  SpinnerGap,
  CheckCircle,
  MagnifyingGlass,
  ArrowClockwise,
  ArrowRight,
  DownloadSimple,
  SealCheck,
  WarningCircle,
  Trash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/ui/toast";
import { programs } from "@/lib/data/programs";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EligibleStudentView {
  studentId: string;
  name: string;
  email: string;
  programSlug: string;
  moduleName: string;
  isEligible: boolean;
  status: "issued" | "pending";
  verificationCode?: string;
  issuedAt?: string;
  certificateId?: string;
}

interface Stats {
  totalEligible: number;
  generatedCount: number;
  pendingCount: number;
}

export function AdminCertificatesPanel() {
  const [selectedCourse, setSelectedCourse] = useState<string>("web-development");
  const [selectedModule, setSelectedModule] = useState<string>("HTML & CSS");
  const [students, setStudents] = useState<EligibleStudentView[]>([]);
  const [stats, setStats] = useState<Stats>({ totalEligible: 0, generatedCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  const selectedProgram = programs.find((p) => p.slug === selectedCourse);
  const availableModules = selectedProgram?.modules.map((m) => m.name) ?? [];

  useEffect(() => {
    if (availableModules.length > 0 && !availableModules.includes(selectedModule)) {
      setSelectedModule(availableModules[0]);
    }
  }, [selectedCourse, availableModules, selectedModule]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/certificates?program=${encodeURIComponent(selectedCourse)}&module=${encodeURIComponent(selectedModule)}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setStudents(json.data.eligibleStudents);
        setStats(json.data.stats);
      } else {
        toast.error(json.error ?? "Failed to load certificate data");
      }
    } catch {
      toast.error("Failed to load certificate data");
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedModule]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetAll = async () => {
    if (
      !window.confirm(
        `Are you sure you want to RESET/DELETE all certificates for "${selectedModule}" (${selectedProgram?.title})? This will allow generating fresh unique certificates for all students.`
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/certificates/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programSlug: selectedCourse,
          moduleName: selectedModule,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Certificates reset successfully!");
        loadData();
      } else {
        toast.error(json.message ?? json.error ?? "Failed to reset certificates");
      }
    } catch {
      toast.error("Failed to reset certificates");
    } finally {
      setIsResetting(false);
    }
  };

  const handleGenerateSingle = async (student: EligibleStudentView) => {
    setGeneratingId(student.studentId);
    try {
      const res = await fetch("/api/admin/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.studentId,
          programSlug: selectedCourse,
          moduleName: selectedModule,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Certificate generated!");
        loadData();
      } else {
        toast.error(json.message ?? json.error ?? "Failed to generate certificate");
      }
    } catch {
      toast.error("Failed to generate certificate");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateBulk = async (forceRegenerate = false) => {
    const targetList = forceRegenerate
      ? students
      : students.filter((s) => s.status === "pending");

    if (targetList.length === 0) {
      toast.info("No students found to generate certificates for!");
      return;
    }

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: targetList.length });

    let successCount = 0;
    let failCount = 0;

    // Process sequentially or in batches of 3 to assign unique sequential codes without race conditions
    for (let i = 0; i < targetList.length; i++) {
      const student = targetList[i];
      try {
        const res = await fetch("/api/admin/certificates/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.studentId,
            programSlug: selectedCourse,
            moduleName: selectedModule,
          }),
        });
        const json = await res.json();
        if (json.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      setBulkProgress({ current: i + 1, total: targetList.length });
    }

    setIsBulkGenerating(false);
    setBulkProgress(null);

    toast.success(`Generation complete! ${successCount} generated successfully${failCount > 0 ? `, ${failCount} failed` : ""}.`);
    loadData();
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.verificationCode && s.verificationCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
              <Certificate size={14} weight="fill" />
              Certificate Automation Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Module Certificates Dashboard
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Automated high-resolution certificate generation & public verification management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={loadData}
              disabled={loading || isBulkGenerating || isResetting}
              className="gap-2 rounded-xl"
            >
              <ArrowClockwise size={16} className={cn(loading && "animate-spin")} />
              Refresh Data
            </Button>

            {stats.generatedCount > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleResetAll}
                disabled={loading || isBulkGenerating || isResetting}
                className="gap-2 rounded-xl text-xs font-bold border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
              >
                {isResetting ? (
                  <>
                    <SpinnerGap size={16} className="animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash size={16} />
                    Reset All Certificates
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              onClick={() => handleGenerateBulk(stats.pendingCount === 0)}
              disabled={isBulkGenerating || isResetting || loading || stats.totalEligible === 0}
              className="gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 shadow-md"
            >
              {isBulkGenerating ? (
                <>
                  <SpinnerGap size={18} className="animate-spin" />
                  Generating ({bulkProgress?.current ?? 0} / {bulkProgress?.total ?? 0})
                </>
              ) : stats.pendingCount === 0 ? (
                <>
                  <Sparkle size={18} weight="fill" />
                  Regenerate All Certificates ({stats.totalEligible})
                </>
              ) : (
                <>
                  <Sparkle size={18} weight="fill" />
                  Generate All Certificates ({stats.pendingCount})
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {programs.map((prog) => (
                <option key={prog.slug} value={prog.slug}>
                  {prog.title} ({prog.modules.length} modules)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Select Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {availableModules.map((modName) => (
                <option key={modName} value={modName}>
                  {modName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Eligible Students
          </span>
          <p className="text-3xl font-black text-foreground">{stats.totalEligible}</p>
          <p className="text-xs text-muted-foreground">Students approved for this module</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Certificates Issued
          </span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.generatedCount}
          </p>
          <p className="text-xs text-muted-foreground">Active & verified certificates</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Pending Generation
          </span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {stats.pendingCount}
          </p>
          <p className="text-xs text-muted-foreground">Ready for automated generation</p>
        </div>
      </div>

      {/* Student Certificates List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Eligible Student List</h2>
            <p className="text-xs text-muted-foreground">
              Showing students for {selectedModule} ({selectedProgram?.title})
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name or code..."
              className="pl-9 rounded-xl text-xs h-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3 rounded-2xl border border-border bg-card">
            <SpinnerGap size={28} className="animate-spin mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">Loading certificate records...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-2xl border border-border bg-card">
            <WarningCircle size={32} className="mx-auto text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No students found</p>
            <p className="text-xs text-muted-foreground">
              No eligible students found for {selectedModule}.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredStudents.map((student) => {
              const isIssued = student.status === "issued";
              const isGenerating = generatingId === student.studentId;

              const downloadUrl = `/api/student/certificates/download?code=${encodeURIComponent(student.verificationCode ?? "")}&studentId=${encodeURIComponent(student.studentId)}&program=${encodeURIComponent(selectedCourse)}&module=${encodeURIComponent(selectedModule)}`;

              return (
                <div
                  key={student.studentId}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/30"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground truncate">{student.name}</h3>
                      {isIssued ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} weight="fill" />
                          ISSUED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          PENDING
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{student.email}</p>

                    {isIssued && student.verificationCode && (
                      <div className="pt-1 flex items-center gap-3 text-xs">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {student.verificationCode}
                        </span>
                        {student.issuedAt && (
                          <span className="text-muted-foreground">Issued: {student.issuedAt}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isIssued ? (
                      <>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs gap-1.5"
                        >
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <DownloadSimple size={14} />
                            Download
                          </a>
                        </Button>

                        {student.verificationCode && (
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="rounded-xl text-xs gap-1.5"
                          >
                            <Link href={`/verify/${encodeURIComponent(student.verificationCode)}`} target="_blank">
                              <SealCheck size={14} />
                              Verify
                            </Link>
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => handleGenerateSingle(student)}
                        disabled={isGenerating || isBulkGenerating}
                        size="sm"
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-sm"
                      >
                        {isGenerating ? (
                          <>
                            <SpinnerGap size={14} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkle size={14} weight="fill" />
                            Generate Certificate
                            <ArrowRight size={13} weight="bold" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
