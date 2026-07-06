import type { Icon } from "@phosphor-icons/react";
import {
  House,
  BookOpen,
  ClipboardText,
  VideoCamera,
  Users,
  ChatsCircle,
  UserCircle,
  Gear,
  ChartBar,
  GraduationCap,
  ChalkboardTeacher,
  Key,
  Broadcast,
  ListChecks,
} from "@phosphor-icons/react";

import type { UserRole } from "@/types/portal";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: Icon;
  description?: string;
}

export const PORTAL_NAV: Record<UserRole, PortalNavItem[]> = {
  student: [
    { href: "/student/dashboard", label: STUDENT_UR.nav.home.label, icon: House, description: STUDENT_UR.nav.home.description },
    { href: "/student/course", label: STUDENT_UR.nav.course.label, icon: BookOpen, description: STUDENT_UR.nav.course.description },
    { href: "/student/classes", label: STUDENT_UR.nav.classes.label, icon: VideoCamera, description: STUDENT_UR.nav.classes.description },
    { href: "/student/trainer", label: STUDENT_UR.nav.trainer.label, icon: ChalkboardTeacher, description: STUDENT_UR.nav.trainer.description },
    { href: "/student/assignments", label: STUDENT_UR.nav.assignments.label, icon: ClipboardText, description: STUDENT_UR.nav.assignments.description },
    { href: "/student/whatsapp", label: STUDENT_UR.nav.whatsapp.label, icon: ChatsCircle, description: STUDENT_UR.nav.whatsapp.description },
    { href: "/student/profile", label: STUDENT_UR.nav.profile.label, icon: UserCircle, description: STUDENT_UR.nav.profile.description },
  ],
  trainer: [
    { href: "/trainer/dashboard", label: "Home", icon: House, description: "Trainer dashboard" },
    { href: "/trainer/students", label: "My Students", icon: Users, description: "See enrolled students" },
    { href: "/trainer/classes", label: "Live Classes", icon: VideoCamera, description: "Schedule Google Meet classes" },
    { href: "/trainer/assignments", label: "Assignments", icon: ClipboardText, description: "Create & review work" },
    { href: "/trainer/materials", label: "Course Videos", icon: BookOpen, description: "Learning materials" },
    { href: "/trainer/settings", label: "Settings", icon: Gear, description: "Edit your profile" },
    { href: "/trainer/profile", label: "My Profile", icon: UserCircle, description: "Your account" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Home", icon: ChartBar, description: "Overview & stats" },
    { href: "/admin/live-classes", label: "Portal Classes", icon: Broadcast, description: "In-portal video rooms" },
    { href: "/admin/enrollments", label: "Registrations", icon: ClipboardText, description: "Approve new students" },
    { href: "/admin/students", label: "Students", icon: GraduationCap, description: "All students" },
    { href: "/admin/credentials", label: "Portal Logins", icon: Key, description: "Student login IDs & passwords" },
    { href: "/admin/attendance", label: "Attendance", icon: ListChecks, description: "Class join records" },
    { href: "/admin/trainers", label: "Trainers", icon: Users, description: "All trainers" },
    { href: "/admin/courses", label: "Courses", icon: BookOpen, description: "Materials & content" },
    { href: "/admin/settings", label: "Settings", icon: Gear, description: "Portal settings" },
  ],
  admin_readonly: [
    { href: "/admin/dashboard", label: "Home", icon: ChartBar, description: "Overview & stats" },
    { href: "/admin/live-classes", label: "Portal Classes", icon: Broadcast, description: "In-portal video rooms" },
    { href: "/admin/enrollments", label: "Registrations", icon: ClipboardText, description: "View applications" },
    { href: "/admin/students", label: "Students", icon: GraduationCap, description: "All students" },
    { href: "/admin/credentials", label: "Portal Logins", icon: Key, description: "Student login IDs" },
    { href: "/admin/attendance", label: "Attendance", icon: ListChecks, description: "Class join records" },
    { href: "/admin/trainers", label: "Trainers", icon: Users, description: "All trainers" },
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
    { label: STUDENT_UR.nav.mainGroup, items: PORTAL_NAV.student.filter((i) => i.href !== "/student/profile") },
    { label: STUDENT_UR.nav.accountGroup, items: PORTAL_NAV.student.filter((i) => i.href === "/student/profile") },
  ],
  trainer: groupNavItems(PORTAL_NAV.trainer, ["/trainer/settings", "/trainer/profile"]),
  admin: groupNavItems(PORTAL_NAV.admin, ["/admin/settings"]),
  admin_readonly: groupNavItems(PORTAL_NAV.admin_readonly, ["/admin/settings"]),
};

export const PORTAL_LABELS: Record<UserRole, string> = {
  student: STUDENT_UR.portalLabel,
  trainer: "Trainer Portal",
  admin: "Super Admin",
  admin_readonly: "Viewer Admin",
};

export const PORTAL_COLORS: Record<UserRole, string> = {
  student: "from-orange-500 to-amber-500",
  trainer: "from-blue-500 to-indigo-500",
  admin: "from-slate-700 to-slate-900",
  admin_readonly: "from-violet-600 to-indigo-900",
};
