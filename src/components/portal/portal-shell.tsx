"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  List,
  X,
  SignOut,
  House,
  SidebarSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PORTAL_LABELS, PORTAL_NAV_GROUPS } from "@/lib/constants/portal-nav";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { SiteLogo } from "@/components/shared/site-logo";
import { PortalAvatar } from "@/components/portal/portal-avatar";
import { SITE_CONFIG } from "@/lib/constants";
import { StudentPortalWelcome } from "@/components/portal/student-portal-welcome";
import { StudentModuleStartBanner } from "@/components/portal/student-module-start-banner";
import { StudentSingleSessionGuard } from "@/components/portal/student-single-session-guard";
import {
  AdminNotificationsBell,
  AdminNavBadge,
} from "@/components/admin/admin-notifications-bell";
import {
  AdminRevenueHeaderButton,
  AdminRevenueSidebarCard,
} from "@/components/admin/admin-revenue-side-panel";
import { useAdminAlertsOptional } from "@/components/admin/admin-alerts-provider";
import { isAdminRole } from "@/lib/auth/admin-roles";
import type { PortalUser, UserRole } from "@/types/portal";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "portal-sidebar-collapsed";

const pressable = "cursor-pointer select-none";

function getAdminDisplayName(name: string, role: UserRole) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? name;
  if (role === "admin_readonly") {
    return `Viewer Admin · ${firstName}`;
  }
  const tatheer = parts.find((part) => part.toLowerCase() === "tatheer");
  const displayFirst =
    tatheer ??
    (name.trim().toLowerCase() === "admin user" ? "Tatheer" : firstName);
  return `Super Admin - ${displayFirst}`;
}

interface PortalShellProps {
  user: PortalUser;
  children: React.ReactNode;
}

export function PortalShell({ user, children }: PortalShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isAdmin = isAdminRole(user.role);
  const headerTitle = isAdmin
    ? getAdminDisplayName(user.name, user.role)
    : `Hello, ${user.name.split(" ")[0]} 👋`;

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const key = "portal-activity-pinged";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void fetch("/api/portal/activity", { method: "POST" }).catch(() => undefined);
  }, []);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((value) => {
      const next = !value;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen lg:h-dvh lg:overflow-hidden bg-zinc-50 flex">
      {user.role === "student" && <StudentSingleSessionGuard />}
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-zinc-200/70 transition-[width] duration-300 ease-in-out",
          sidebarCollapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        <SidebarContent
          user={user}
          navGroups={PORTAL_NAV_GROUPS[user.role]}
          pathname={pathname}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapsed}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl">
            <SidebarContent
              user={user}
              navGroups={PORTAL_NAV_GROUPS[user.role]}
              pathname={pathname}
              onLogout={handleLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-0 lg:overflow-hidden transition-[padding] duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-[4.5rem]" : "lg:pl-64"
        )}
      >
        <header className="shrink-0 sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <List size={22} weight="bold" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] text-muted uppercase tracking-wide">
                {PORTAL_LABELS[user.role]}
              </p>
              <p className="font-semibold text-sm truncate">{headerTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isAdmin && (
              <span className="hidden md:inline-flex">
                <AdminRevenueHeaderButton />
              </span>
            )}
            {isAdmin && <AdminNotificationsBell />}
            <Button variant="outline" size="sm" asChild className="hidden sm:flex h-8 text-xs">
              <Link href="/">
                <House size={15} weight="duotone" />
                Website
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 text-xs">
              <SignOut size={16} weight="bold" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 [&>*]:min-h-0">
          {user.role === "student" && (
            <div className="mb-4">
              <StudentModuleStartBanner />
            </div>
          )}
          {children}
        </main>
        {user.role === "student" && <StudentPortalWelcome studentName={user.name} />}
      </div>
    </div>
  );
}

function SidebarContent({
  user,
  navGroups,
  pathname,
  onLogout,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  user: PortalUser;
  navGroups: (typeof PORTAL_NAV_GROUPS)["admin"];
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const adminAlerts = useAdminAlertsOptional();
  const enrollmentBadgeCount =
    adminAlerts && isAdminRole(user.role)
      ? adminAlerts.unreadCount > 0
        ? adminAlerts.unreadCount
        : adminAlerts.pendingCount
      : 0;

  const isAdmin = isAdminRole(user.role);
  const displayName = isAdmin ? getAdminDisplayName(user.name, user.role) : user.name;
  const portalSubtitle = isAdmin
    ? user.role === "admin_readonly"
      ? "Viewer Admin"
      : "Admin Portal"
    : user.role === "trainer"
      ? "Trainer Portal"
      : "Student Portal";

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white">
      {/* Logo + collapse */}
      <div
        className={cn(
          "shrink-0 border-b border-zinc-100",
          collapsed ? "px-2 py-3" : "px-4 py-4"
        )}
      >
        <div className={cn("flex items-center gap-2", collapsed ? "flex-col" : "justify-between")}>
          {!collapsed ? (
            <Link href="/" className={cn(pressable, "flex items-center gap-2.5 min-w-0")}>
              <SiteLogo variant="portal" href={null} className="h-8 shrink-0" />
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-bold text-zinc-900 truncate">{SITE_CONFIG.shortName}</p>
                <p className="text-[10px] text-zinc-400 truncate">{portalSubtitle}</p>
              </div>
            </Link>
          ) : (
            <Link href="/" className={cn(pressable, "flex justify-center")} title={SITE_CONFIG.shortName}>
              <SiteLogo variant="portal" href={null} className="h-7" />
            </Link>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                pressable,
                "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 shadow-sm"
              )}
            >
              <SidebarSimple
                size={18}
                weight="duotone"
                className={cn("transition-transform duration-300", collapsed && "scale-x-[-1]")}
              />
            </button>
          )}

          {onNavigate && !collapsed && (
            <button
              type="button"
              onClick={onNavigate}
              className={cn(pressable, "p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 lg:hidden")}
            >
              <X size={18} weight="bold" />
            </button>
          )}
        </div>

        {!collapsed && (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/80 px-2.5 py-2">
            <PortalAvatar
              name={user.name}
              avatarUrl={user.avatarUrl}
              avatarInitials={user.avatarInitials}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate text-xs text-zinc-900">{displayName}</p>
              <p className="text-[10px] truncate text-zinc-400">{user.email}</p>
              {!isAdmin && user.programSlug && (user.role === "student" || user.role === "trainer") && (
                <ProgramCategoryBadge programSlug={user.programSlug} className="mt-0.5" />
              )}
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mt-2.5 flex justify-center">
            <PortalAvatar
              name={user.name}
              avatarUrl={user.avatarUrl}
              avatarInitials={user.avatarInitials}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none",
          collapsed ? "px-2 py-2" : "px-3 py-3"
        )}
      >
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={cn(groupIndex > 0 && "mt-4")}>
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                const showEnrollmentBadge =
                  item.href === "/admin/enrollments" && enrollmentBadgeCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : item.description}
                    aria-label={item.label}
                    className={cn(
                      pressable,
                      "relative flex items-center rounded-lg text-sm font-medium",
                      collapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2",
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    <Icon
                      size={20}
                      weight={active ? "fill" : "regular"}
                      className="shrink-0"
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 min-w-0 truncate">{item.label}</span>
                        {showEnrollmentBadge && <AdminNavBadge count={enrollmentBadgeCount} />}
                      </>
                    )}
                    {collapsed && showEnrollmentBadge && (
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — revenue + logout unchanged */}
      <div
        className={cn(
          "shrink-0 border-t border-zinc-100 bg-white py-2.5",
          collapsed ? "px-2 space-y-1.5" : "px-3 space-y-1.5"
        )}
      >
        {isAdmin && <AdminRevenueSidebarCard compact={collapsed} />}
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            pressable,
            "flex w-full items-center rounded-lg text-sm font-medium text-red-600 hover:bg-red-50",
            collapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2"
          )}
        >
          <SignOut size={18} weight="bold" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}
