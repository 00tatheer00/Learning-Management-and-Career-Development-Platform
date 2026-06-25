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
    { href: "/student/dashboard", label: "Home", icon: House, description: "Your main page" },
    { href: "/student/course", label: "My Course", icon: BookOpen, description: "Videos & lessons" },
    { href: "/student/classes", label: "Live Classes", icon: VideoCamera, description: "Join online class" },
    { href: "/student/trainer", label: "My Trainer", icon: ChalkboardTeacher, description: "Your course trainer" },
    { href: "/student/assignments", label: "Assignments", icon: ClipboardText, description: "Submit homework" },
    { href: "/student/whatsapp", label: "WhatsApp Group", icon: ChatsCircle, description: "Chat with class" },
    { href: "/student/profile", label: "My Profile", icon: UserCircle, description: "Your details" },
  ],
  trainer: [
    { href: "/trainer/dashboard", label: "Home", icon: House, description: "Trainer dashboard" },
    { href: "/trainer/students", label: "My Students", icon: Users, description: "See enrolled students" },
    { href: "/trainer/classes", label: "Live Classes", icon: VideoCamera, description: "Schedule & links" },
    { href: "/trainer/assignments", label: "Assignments", icon: ClipboardText, description: "Create & review work" },
    { href: "/trainer/materials", label: "Course Videos", icon: BookOpen, description: "Learning materials" },
    { href: "/trainer/settings", label: "Settings", icon: Gear, description: "Edit your profile" },
    { href: "/trainer/profile", label: "My Profile", icon: UserCircle, description: "Your account" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Home", icon: ChartBar, description: "Overview & stats" },
    { href: "/admin/enrollments", label: "Registrations", icon: ClipboardText, description: "Approve new students" },
    { href: "/admin/students", label: "Students", icon: GraduationCap, description: "All students" },
    { href: "/admin/credentials", label: "Portal Logins", icon: Key, description: "Student login IDs & passwords" },
    { href: "/admin/trainers", label: "Trainers", icon: Users, description: "All trainers" },
    { href: "/admin/courses", label: "Courses", icon: BookOpen, description: "Materials & content" },
    { href: "/admin/settings", label: "Settings", icon: Gear, description: "Portal settings" },
  ],
};

export const PORTAL_LABELS: Record<UserRole, string> = {
  student: "Student Portal",
  trainer: "Trainer Portal",
  admin: "Super Admin",
};

export const PORTAL_COLORS: Record<UserRole, string> = {
  student: "from-orange-500 to-amber-500",
  trainer: "from-blue-500 to-indigo-500",
  admin: "from-slate-700 to-slate-900",
};
