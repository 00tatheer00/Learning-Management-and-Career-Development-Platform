"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Video,
  ClipboardList,
  CheckCircle2,
  Award,
  GraduationCap,
  Clock,
  ChevronRight,
  ClipboardCheck,
  Calendar,
  FileCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudentGroup {
  moduleName: string;
  students: unknown[];
}

interface TrainerDashboardUIProps {
  welcomeName: string;
  designation: string;
  courseTitle: string;
  activeLevel?: string;
  isAll: boolean;
  studentsCount: number;
  assignmentsCount: number;
  upcomingSessionsCount: number;
  pendingReviewsCount: number;
  completedSessionsCount: number;
  attendanceRatePct: number;
  submissionRatePct: number;
  totalSubmissionsCount: number;
  moduleGroups: StudentGroup[];
}

// Mini sparkline data generators for module cards
const moduleSparklines = [
  [{ v: 10 }, { v: 18 }, { v: 24 }, { v: 32 }, { v: 42 }, { v: 55 }],
  [{ v: 15 }, { v: 28 }, { v: 40 }, { v: 52 }, { v: 65 }, { v: 75 }],
  [{ v: 1 }, { v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 3 }],
  [{ v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }, { v: 6 }, { v: 7 }],
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number | string }>;
  label?: string;
  unit?: string;
}

// Custom Glassmorphic Tooltip for Recharts
function CustomTooltip({ active, payload, label, unit = "" }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-800 backdrop-blur-md">
        <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
        <p className="text-sm font-black text-white">
          {payload[0].value}
          {unit}
        </p>
      </div>
    );
  }
  return null;
}

export function TrainerDashboardUI({
  welcomeName,
  designation,
  courseTitle,
  activeLevel,
  isAll,
  studentsCount,
  assignmentsCount,
  upcomingSessionsCount,
  pendingReviewsCount,
  completedSessionsCount,
  attendanceRatePct,
  submissionRatePct,
  totalSubmissionsCount,
  moduleGroups,
}: TrainerDashboardUIProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeModuleName =
    moduleGroups.length > 0
      ? moduleGroups[0].moduleName
      : isAll
      ? "Full Program"
      : `Level ${activeLevel}`;

  // Calculated attendance data dynamic update
  const dynamicAttendance = [
    { month: "May", rate: Math.max(30, attendanceRatePct - 35) },
    { month: "Jun", rate: Math.max(45, attendanceRatePct - 20) },
    { month: "Jul", rate: Math.max(60, attendanceRatePct - 10) },
    { month: "Aug", rate: attendanceRatePct },
  ];

  const dynamicSubmission = [
    { month: "May", completion: 0 },
    { month: "Jun", completion: Math.max(0, submissionRatePct - 40) },
    { month: "Jul", completion: Math.max(0, submissionRatePct - 15) },
    { month: "Aug", completion: submissionRatePct },
  ];

  const dynamicClasses = [
    { month: "May", classes: 0 },
    { month: "Jun", classes: Math.round(completedSessionsCount * 0.3) },
    { month: "Jul", classes: Math.round(completedSessionsCount * 0.7) },
    { month: "Aug", classes: completedSessionsCount },
  ];

  const dynamicRoster = [
    { month: "May", students: Math.round(studentsCount * 0.4) },
    { month: "Jun", students: Math.round(studentsCount * 0.65) },
    { month: "Jul", students: Math.round(studentsCount * 0.85) },
    { month: "Aug", students: studentsCount },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Header (Clean White SaaS Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-indigo-50/40 to-white border border-slate-200/90 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100/70 px-3 py-1 rounded-full border border-indigo-200">
            Trainer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Welcome, {welcomeName}!
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            {designation} · <span className="text-indigo-600 font-black">{courseTitle}</span>
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button
            size="sm"
            asChild
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs h-10 px-4 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <Link href="/trainer/classes" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>Portal Classes</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Banner - Active Module Scope (Full High Contrast Text) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 shadow-xs hover:border-amber-500/50 transition-all">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-600 text-white shadow-sm shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wide text-amber-950">
            Active Module Scope: <span className="text-amber-950 font-black underline decoration-amber-600 underline-offset-4">{activeModuleName}</span>
          </span>
        </div>
        <div className="shrink-0 bg-amber-700 text-white font-black uppercase px-4 py-1.5 rounded-full text-xs tracking-wider shadow-sm border border-amber-800">
          {studentsCount} ENROLLED STUDENTS
        </div>
      </div>

      {/* Main KPI Cards Row (4 Always-White SaaS Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Students */}
        <Link
          href="/trainer/students"
          className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-500/60 transition-all duration-300 flex items-center justify-between relative overflow-hidden"
        >
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                MY STUDENTS
              </span>
            </div>
            <p className="text-4.5xl font-black tabular-nums text-indigo-600 opacity-100 mt-2">
              {studentsCount}
            </p>
            <p className="text-xs font-semibold text-slate-500">Total enrolled students</p>
          </div>
          {mounted && (
            <div className="w-24 h-14 relative z-10 opacity-90 group-hover:scale-105 transition-transform">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moduleSparklines[0]}>
                  <defs>
                    <linearGradient id="kpiIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2.5} fill="url(#kpiIndigo)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Link>

        {/* Card 2: Assignments */}
        <Link
          href="/trainer/assignments"
          className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-500/60 transition-all duration-300 flex items-center justify-between relative overflow-hidden"
        >
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/30">
                <ClipboardList className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                ASSIGNMENTS
              </span>
            </div>
            <p className="text-4.5xl font-black tabular-nums text-amber-600 opacity-100 mt-2">
              {assignmentsCount}
            </p>
            <p className="text-xs font-semibold text-slate-500">Pending to grade</p>
          </div>
          <ClipboardCheck className="w-20 h-20 opacity-10 text-amber-600 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform pointer-events-none" />
        </Link>

        {/* Card 3: Upcoming Classes */}
        <Link
          href="/trainer/classes"
          className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-500/60 transition-all duration-300 flex items-center justify-between relative overflow-hidden"
        >
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <Video className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                UPCOMING CLASSES
              </span>
            </div>
            <p className="text-4.5xl font-black tabular-nums text-emerald-600 opacity-100 mt-2">
              {upcomingSessionsCount}
            </p>
            <p className="text-xs font-semibold text-slate-500">Scheduled sessions</p>
          </div>
          <Calendar className="w-20 h-20 opacity-10 text-emerald-600 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform pointer-events-none" />
        </Link>

        {/* Card 4: To Review */}
        <Link
          href="/trainer/assignments"
          className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-500/60 transition-all duration-300 flex items-center justify-between relative overflow-hidden"
        >
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-700 text-white shadow-md shadow-slate-700/30">
                <FileCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                TO REVIEW
              </span>
            </div>
            <p className="text-4.5xl font-black tabular-nums text-slate-800 opacity-100 mt-2">
              {pendingReviewsCount}
            </p>
            <p className="text-xs font-semibold text-slate-500">Pending submissions</p>
          </div>
          <CheckCircle2 className="w-20 h-20 opacity-10 text-slate-600 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform pointer-events-none" />
        </Link>
      </div>

      {/* Course & Performance Analytics Section (4 White Recharts Cards) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-600">
            Course & Performance Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Class Attendance (Area Chart) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-sky-600 uppercase tracking-wider">
                  CLASS ATTENDANCE
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700">
                  RATE %
                </span>
              </div>
              <p className="text-4.5xl font-black tabular-nums text-sky-600 mt-2">
                {attendanceRatePct}%
              </p>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-32 w-full pt-1">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicAttendance} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#64748b" }} />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Area type="monotone" dataKey="rate" stroke="#0284c7" strokeWidth={2.5} fill="url(#attendanceGrad)" dot={{ r: 3, fill: "#0284c7" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <p className="text-xs font-bold text-sky-700 pt-1 border-t border-slate-100">
              Average student presence
            </p>
          </div>

          {/* Card 2: Submissions (Bar Chart) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-violet-600 uppercase tracking-wider">
                  SUBMISSIONS
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-700">
                  COMPLETION
                </span>
              </div>
              <p className="text-4.5xl font-black tabular-nums text-violet-600 mt-2">
                {submissionRatePct}%
              </p>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-32 w-full pt-1">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicSubmission} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#64748b" }} />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Bar dataKey="completion" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <p className="text-xs font-bold text-violet-700 pt-1 border-t border-slate-100">
              {totalSubmissionsCount} Total turned in
            </p>
          </div>

          {/* Card 3: Live Classes (Step Line Chart) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                  LIVE CLASSES
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700">
                  CONDUCTED
                </span>
              </div>
              <p className="text-4.5xl font-black tabular-nums text-emerald-600 mt-2">
                {completedSessionsCount}
              </p>
            </div>

            {/* Recharts Line Chart (Step) */}
            <div className="h-32 w-full pt-1">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynamicClasses} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis domain={[0, 12]} ticks={[0, 4, 8, 12]} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#64748b" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="stepAfter" dataKey="classes" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: "#059669" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <p className="text-xs font-bold text-emerald-700 pt-1 border-t border-slate-100">
              Sessions completed
            </p>
          </div>

          {/* Card 4: Active Roster (Area Chart) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                  ACTIVE ROSTER
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700">
                  ENROLLED
                </span>
              </div>
              <p className="text-4.5xl font-black tabular-nums text-amber-600 mt-2">
                {studentsCount}
              </p>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-32 w-full pt-1">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicRoster} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rosterGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d97706" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#64748b" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="students" stroke="#d97706" strokeWidth={2.5} fill="url(#rosterGrad)" dot={{ r: 3, fill: "#d97706" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <p className="text-xs font-bold text-amber-700 pt-1 border-t border-slate-100">
              Students in active scope
            </p>
          </div>
        </div>
      </div>

      {/* Students by Module Section (4 White Module Cards) */}
      {moduleGroups.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-600">
              Students by Module
            </h2>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-bold text-slate-600 hover:text-indigo-600 gap-1">
              <Link href="/trainer/students">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {moduleGroups.map((group, idx) => {
              const themeStyles = [
                { badge: "bg-indigo-600", text: "text-indigo-600", label: "text-indigo-600", stroke: "#4f46e5", gradId: "modInd", border: "hover:border-indigo-500/60" },
                { badge: "bg-amber-600", text: "text-amber-600", label: "text-amber-600", stroke: "#d97706", gradId: "modAmb", border: "hover:border-amber-500/60" },
                { badge: "bg-emerald-600", text: "text-emerald-600", label: "text-emerald-600", stroke: "#059669", gradId: "modEme", border: "hover:border-emerald-500/60" },
                { badge: "bg-teal-600", text: "text-teal-600", label: "text-teal-600", stroke: "#0d9488", gradId: "modTeal", border: "hover:border-teal-500/60" },
              ];
              const theme = themeStyles[idx % themeStyles.length];
              const sparkData = moduleSparklines[idx % moduleSparklines.length];
              const pctOfTotal = studentsCount > 0 ? Math.round((group.students.length / studentsCount) * 100) : 0;

              return (
                <Link
                  key={group.moduleName}
                  href={`/trainer/students?module=${encodeURIComponent(group.moduleName)}`}
                  className={cn(
                    "group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden",
                    theme.border
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-xs", theme.badge)}>
                        MODULE {idx + 1}
                      </span>
                      <span className={cn("text-xs font-black uppercase tracking-wider", theme.label)}>
                        {group.students.length} STUDENTS
                      </span>
                    </div>
                    <p className={cn("text-sm font-bold truncate pt-1", theme.label)}>
                      {group.moduleName}
                    </p>
                    <p className={cn("text-4.5xl font-black tabular-nums", theme.text)}>
                      {group.students.length}
                    </p>
                  </div>

                  {/* Mini Recharts Area Sparkline */}
                  <div className="h-16 w-full my-2">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id={theme.gradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={theme.stroke} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={theme.stroke} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={theme.stroke} strokeWidth={2.5} fill={`url(#${theme.gradId})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Bottom Progress Fill Line */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", theme.badge)}
                        style={{ width: `${Math.min(100, Math.max(8, pctOfTotal))}%` }}
                      />
                    </div>
                    <p className={cn("text-[10px] font-black text-right", theme.label)}>
                      {pctOfTotal}% of total roster
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Progress Bottom Banner */}
      <div className="bg-gradient-to-r from-white via-indigo-50/40 to-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-600 border border-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              OVERALL PROGRESS
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              All modules combined
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 text-xs font-black text-indigo-600">
            68%
          </div>
          <div className="space-y-1 min-w-[140px]">
            <p className="text-[11px] font-bold text-slate-600">Average completion</p>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-[68%]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>
              <strong className="text-sm font-black text-slate-900">{studentsCount}</strong> Total active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>
              <strong className="text-sm font-black text-slate-900">{upcomingSessionsCount}</strong> Classes this week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
