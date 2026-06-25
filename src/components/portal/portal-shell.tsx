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
import { PORTAL_COLORS, PORTAL_LABELS, PORTAL_NAV } from "@/lib/constants/portal-nav";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { SiteLogo } from "@/components/shared/site-logo";
import { PortalAvatar } from "@/components/portal/portal-avatar";
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
import type { PortalUser } from "@/types/portal";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "portal-sidebar-collapsed";

interface PortalShellProps {
  user: PortalUser;
  children: React.ReactNode;
}

export function PortalShell({ user, children }: PortalShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navItems = PORTAL_NAV[user.role];
  const isAdmin = user.role === "admin";

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      setSidebarCollapsed(true);
    }
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
    <div className="min-h-screen lg:h-dvh lg:overflow-hidden bg-surface flex">
      {user.role === "student" && <StudentSingleSessionGuard />}
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 transition-[width] duration-300 ease-in-out shadow-[4px_0_24px_-12px_rgba(0,0,0,0.15)]",
          sidebarCollapsed ? "w-[4.5rem]" : "w-64",
          isAdmin
            ? "bg-zinc-950 border-r border-zinc-800/80"
            : "bg-white border-r border-zinc-200/80"
        )}
      >
        <SidebarContent
          user={user}
          navItems={navItems}
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
          <aside
            className={cn(
              "relative w-72 max-w-[85vw] h-full shadow-2xl",
              isAdmin ? "bg-zinc-950" : "bg-white"
            )}
          >
            <SidebarContent
              user={user}
              navItems={navItems}
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
          <header className="shrink-0 sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-5 h-14 flex items-center justify-between gap-4">
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
                <p className="font-semibold text-sm truncate">
                  Hello, {user.name.split(" ")[0]} 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {user.role === "admin" && <AdminRevenueHeaderButton />}
              {user.role === "admin" && <AdminNotificationsBell />}
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

          <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
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
  navItems,
  pathname,
  onLogout,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  user: PortalUser;
  navItems: (typeof PORTAL_NAV)["student"];
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const adminAlerts = useAdminAlertsOptional();
  const enrollmentBadgeCount =
    adminAlerts && user.role === "admin"
      ? adminAlerts.unreadCount > 0
        ? adminAlerts.unreadCount
        : adminAlerts.pendingCount
      : 0;

  const isAdmin = user.role === "admin";
  const isDark = isAdmin;

  const programGradient =
    user.programSlug && (user.role === "student" || user.role === "trainer")
      ? (getProgramCategory(user.programSlug)?.headerGradient ?? PORTAL_COLORS[user.role])
      : null;

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "shrink-0 border-b transition-all duration-300",
          isDark ? "border-zinc-800/80" : "border-zinc-100",
          collapsed ? "px-2 py-3" : "px-4 py-3.5"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "flex-col" : "justify-between"
          )}
        >
          {collapsed ? (
            <SiteLogo variant="portal" href="/" onDark={isDark} className="h-7" />
          ) : (
            <SiteLogo variant="portal" href="/" onDark={isDark} className="h-8" />
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "flex items-center justify-center rounded-lg transition-all",
                collapsed ? "h-8 w-8" : "h-8 w-8",
                isDark
                  ? "text-zinc-400 hover:text-white hover:bg-white/10"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              )}
            >
              <SidebarSimple
                size={20}
                weight="duotone"
                className={cn(
                  "transition-transform duration-300",
                  collapsed && "scale-x-[-1]"
                )}
              />
            </button>
          )}

          {onNavigate && !collapsed && (
            <button
              type="button"
              onClick={onNavigate}
              className={cn(
                "p-1.5 rounded-lg lg:hidden",
                isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
              )}
            >
              <X size={18} weight="bold" />
            </button>
          )}
        </div>

        {!collapsed && (
          <>
            <p
              className={cn(
                "text-[10px] uppercase tracking-widest mt-3 mb-2.5 font-medium",
                isDark ? "text-zinc-500" : "text-zinc-400"
              )}
            >
              {PORTAL_LABELS[user.role]}
            </p>
            <div className="flex items-center gap-2.5">
              <PortalAvatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                avatarInitials={user.avatarInitials}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-semibold truncate text-sm",
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  )}
                >
                  {user.name}
                </p>
                <p
                  className={cn(
                    "text-[11px] truncate",
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  )}
                >
                  {user.email}
                </p>
                {programGradient && user.programSlug && (
                  <ProgramCategoryBadge
                    programSlug={user.programSlug}
                    variant="onDark"
                    className="mt-1"
                  />
                )}
              </div>
            </div>
          </>
        )}

        {collapsed && (
          <div className="mt-3 flex justify-center">
            <PortalAvatar
              name={user.name}
              avatarUrl={user.avatarUrl}
              avatarInitials={user.avatarInitials}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none py-2",
          collapsed ? "px-2 space-y-0.5" : "px-2.5 space-y-0.5"
        )}
      >
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                "relative flex items-center rounded-lg transition-all duration-150",
                collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
                active
                  ? isDark
                    ? "bg-white/10 text-white shadow-sm"
                    : "bg-primary/10 text-primary font-semibold"
                  : isDark
                    ? "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                active && !isDark && "font-semibold"
              )}
            >
              {active && (
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full",
                    collapsed ? "hidden" : "h-5",
                    isDark ? "bg-primary" : "bg-primary"
                  )}
                />
              )}
              <Icon
                size={20}
                weight={active ? "fill" : "duotone"}
                className="shrink-0"
              />
              {!collapsed && (
                <>
                  <span className="flex-1 min-w-0 text-sm truncate">{item.label}</span>
                  {showEnrollmentBadge && <AdminNavBadge count={enrollmentBadgeCount} />}
                </>
              )}
              {collapsed && showEnrollmentBadge && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-zinc-950" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "shrink-0 border-t py-2",
          isDark ? "border-zinc-800/80" : "border-zinc-100",
          collapsed ? "px-2 space-y-1" : "px-2.5 space-y-1"
        )}
      >
        {user.role === "admin" && (
          <AdminRevenueSidebarCard compact={collapsed} dark={isDark} />
        )}
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium transition-colors",
            collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
            isDark
              ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
              : "text-red-600 hover:bg-red-50"
          )}
        >
          <SignOut size={18} weight="bold" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}
