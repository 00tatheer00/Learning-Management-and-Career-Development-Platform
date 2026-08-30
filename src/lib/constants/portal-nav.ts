import type { Icon } from "@phosphor-icons/react";
import {
  House,
  BookOpen,
  ClipboardText,
  VideoCamera,
  Users,
  UserCircle,
  Gear,
  ChartBar,
  GraduationCap,
  ChalkboardTeacher,
  Key,
  Broadcast,
  ListChecks,
  FilmStrip,
  Certificate,
  Lifebuoy,
} from "@phosphor-icons/react";

import type { UserRole } from "@/types/portal";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: Icon;
  description?: string;
}

export const PORTAL_NAV: Record<UserRole, PortalNavItem[]> = {
  student: [
    { href: "/student/dashboard", label: "Home", icon: House, description: "Your dashboard" },
    { href: "/student/modules", label: "My Modules", icon: GraduationCap, description: "Your enrolled & locked modules" },
    { href: "/student/recordings", label: "Class Recordings", icon: FilmStrip, description: "Google Drive class recordings & notes" },
    { href: "/student/classes", label: "Live Classes", icon: VideoCamera, description: "Join online class" },
    { href: "/student/assignments", label: "Assignments", icon: ClipboardText, description: "Homework & tasks" },
    { href: "/student/attendance", label: "Attendance", icon: ListChecks, description: "Your attendance %" },
    { href: "/student/certificates", label: "Certificates", icon: Certificate, description: "Module certificates" },
    { href: "/student/trainer", label: "My Trainer", icon: ChalkboardTeacher, description: "Your instructor" },
    { href: "/student/support", label: "Support", icon: Lifebuoy, description: "Submit & track issues" },
    { href: "/student/profile", label: "Profile", icon: UserCircle, description: "Account & logins" },
  ],
  trainer: [
    { href: "/trainer/dashboard", label: "Home", icon: House, description: "Trainer dashboard" },
    { href: "/trainer/students", label: "My Students", icon: Users, description: "See enrolled students" },
    { href: "/trainer/classes", label: "Live Classes", icon: VideoCamera, description: "Schedule Google Meet classes" },
    { href: "/trainer/recordings", label: "Class Recordings", icon: FilmStrip, description: "Google Drive class recordings" },
    { href: "/trainer/attendance", label: "Attendance", icon: ListChecks, description: "Day & module-wise attendance" },
    { href: "/trainer/assignments", label: "Assignments", icon: ClipboardText, description: "Create & review work" },
    { href: "/trainer/materials", label: "Course Content", icon: BookOpen, description: "Learning materials" },
    { href: "/trainer/settings", label: "Settings", icon: Gear, description: "Edit your profile" },
    { href: "/trainer/profile", label: "My Profile", icon: UserCircle, description: "Your account" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Home", icon: ChartBar, description: "Overview & stats" },
    { href: "/admin/recordings", label: "Class Recordings", icon: FilmStrip, description: "Google Drive class recordings" },
    { href: "/admin/live-classes", label: "Portal Classes", icon: Broadcast, description: "In-portal video rooms" },
    { href: "/admin/enrollments", label: "Registrations", icon: ClipboardText, description: "Approve new students" },
    { href: "/admin/certificates", label: "Certificates", icon: Certificate, description: "Module certificates" },
    { href: "/admin/students", label: "Students", icon: GraduationCap, description: "All students" },
    { href: "/admin/credentials", label: "Portal Logins", icon: Key, description: "Student login IDs & passwords" },
    { href: "/admin/attendance", label: "Attendance", icon: ListChecks, description: "Day & module-wise attendance" },
    { href: "/admin/trainers", label: "Trainers", icon: Users, description: "All trainers" },
    { href: "/admin/support", label: "Support", icon: Lifebuoy, description: "Student tickets & issues" },
    { href: "/admin/courses", label: "Courses", icon: BookOpen, description: "Materials & content" },
    { href: "/admin/settings", label: "Settings", icon: Gear, description: "Portal settings" },
  ],
  admin_readonly: [
    { href: "/admin/dashboard", label: "Home", icon: ChartBar, description: "Overview & stats" },
    { href: "/admin/recordings", label: "Class Recordings", icon: FilmStrip, description: "Google Drive class recordings" },
    { href: "/admin/live-classes", label: "Portal Classes", icon: Broadcast, description: "In-portal video rooms" },
    { href: "/admin/enrollments", label: "Registrations", icon: ClipboardText, description: "Manage applications" },
    { href: "/admin/certificates", label: "Certificates", icon: Certificate, description: "Module certificates" },
    { href: "/admin/students", label: "Students", icon: GraduationCap, description: "All students" },
    { href: "/admin/credentials", label: "Portal Logins", icon: Key, description: "Student login IDs" },
    { href: "/admin/attendance", label: "Attendance", icon: ListChecks, description: "Day & module-wise attendance" },
    { href: "/admin/trainers", label: "Trainers", icon: Users, description: "All trainers" },
    { href: "/admin/support", label: "Support", icon: Lifebuoy, description: "Student tickets & issues" },
    { href: "/admin/courses", label: "Courses", icon: BookOpen, description: "Materials & content" },
    { href: "/admin/settings", label: "Settings", icon: Gear, description: "Portal settings" },
  ],
};

export interface PortalNavGroup {
  label: string;
  items: PortalNavItem[];
}

function groupNavItems(items: PortalNavItem[], accountHrefs: string[]): PortalNavGroup[] {
  const main = items.filter((item) => !accountHrefs.includes(item.href));
  const account = items.filter((item) => accountHrefs.includes(item.href));
  return [
    { label: "Main", items: main },
    ...(account.length > 0 ? [{ label: "Account", items: account }] : []),
  ];
}

export const PORTAL_NAV_GROUPS: Record<UserRole, PortalNavGroup[]> = {
  student: [
    { label: "Main", items: PORTAL_NAV.student.filter((i) => i.href !== "/student/profile" && i.href !== "/student/support") },
    { label: "Help", items: PORTAL_NAV.student.filter((i) => i.href === "/student/support") },
    { label: "Account", items: PORTAL_NAV.student.filter((i) => i.href === "/student/profile") },
  ],
  trainer: groupNavItems(PORTAL_NAV.trainer, ["/trainer/settings", "/trainer/profile"]),
  admin: groupNavItems(PORTAL_NAV.admin, ["/admin/settings"]),
  admin_readonly: groupNavItems(PORTAL_NAV.admin_readonly, ["/admin/settings"]),
};

export const PORTAL_LABELS: Record<UserRole, string> = {
  student: "Student Portal",
  trainer: "Trainer Portal",
  admin: "Super Admin",
  admin_readonly: "Admin",
};

export const PORTAL_COLORS: Record<UserRole, string> = {
  student: "from-[#0a0a0b] to-[#18181b]",
  trainer: "from-blue-500 to-indigo-500",
  admin: "from-slate-700 to-slate-900",
  admin_readonly: "from-violet-600 to-indigo-900",
};

export const STUDENT_PAGE_TITLES: Record<string, string> = {
  "/student/dashboard": "Home",
  "/student/modules": "My Modules",
  "/student/course": "My Course",
  "/student/classes": "Live Classes",
  "/student/recordings": "Class Recordings",
  "/student/recordings/drive": "Class Recordings",
  "/student/drive-recordings": "Class Recordings",
  "/student/assignments": "Assignments",
  "/student/attendance": "Attendance",
  "/student/certificates": "Certificates",
  "/student/trainer": "My Trainer",
  "/student/support": "Support",
  "/student/profile": "Profile",
};

export function getStudentPageTitle(pathname: string): string {
  if (STUDENT_PAGE_TITLES[pathname]) return STUDENT_PAGE_TITLES[pathname];
  const nested = Object.entries(STUDENT_PAGE_TITLES)
    .filter(([path]) => path !== "/student/dashboard" && pathname.startsWith(`${path}/`))
    .sort((a, b) => b[0].length - a[0].length)[0];
  return nested?.[1] ?? "Portal";
}
