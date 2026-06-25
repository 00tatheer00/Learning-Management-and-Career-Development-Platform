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
  CaretRight,
  CaretLineLeft,
  CaretLineRight,
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
    <div className="min-h-screen bg-surface flex">
      {user.role === "student" && <StudentSingleSessionGuard />}
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 border-r border-border bg-background z-40 transition-[width] duration-300 ease-in-out",
          sidebarCollapsed ? "w-[4.75rem]" : "w-72"
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
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-80 max-w-[85vw] bg-background h-full shadow-xl">
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
          "flex-1 flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-[4.75rem]" : "lg:pl-72"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-secondary"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <List size={24} weight="bold" />
            </button>
            <div>
              <p className="text-xs text-muted">{PORTAL_LABELS[user.role]}</p>
              <p className="font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                Hello, {user.name.split(" ")[0]} 👋
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "admin" && <AdminRevenueHeaderButton />}
            {user.role === "admin" && <AdminNotificationsBell />}
            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <Link href="/">
                <House size={16} weight="duotone" />
                Main Website
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <SignOut size={18} weight="bold" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {user.role === "student" && (
            <div className="mb-6">
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

  const gradient =
    user.programSlug && (user.role === "student" || user.role === "trainer")
      ? (getProgramCategory(user.programSlug)?.headerGradient ?? PORTAL_COLORS[user.role])
      : PORTAL_COLORS[user.role];

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div
        className={cn(
          "shrink-0 bg-gradient-to-br text-white transition-all duration-300",
          gradient,
          collapsed ? "px-2 py-3" : "p-4 pb-3"
        )}
      >
        <div
          className={cn(
            "flex items-center mb-3",
            collapsed ? "justify-center" : "justify-between gap-2"
          )}
        >
          <SiteLogo
            variant="portal"
            href="/"
            onDark
            className={cn(collapsed && "h-6")}
          />
          {onNavigate && !collapsed && (
            <button type="button" onClick={onNavigate} className="p-1 rounded-lg hover:bg-white/20">
              <X size={20} weight="bold" />
            </button>
          )}
        </div>

        {!collapsed && (
          <p className="text-[10px] opacity-80 uppercase tracking-wider mb-2.5">
            {PORTAL_LABELS[user.role]}
          </p>
        )}

        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <PortalAvatar
            name={user.name}
            avatarUrl={user.avatarUrl}
            avatarInitials={user.avatarInitials}
            size={collapsed ? "sm" : "md"}
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold truncate text-sm">{user.name}</p>
              <p className="text-[11px] opacity-80 truncate">{user.email}</p>
              {user.programSlug && (user.role === "student" || user.role === "trainer") && (
                <ProgramCategoryBadge programSlug={user.programSlug} variant="onDark" className="mt-1" />
              )}
            </div>
          )}
        </div>
      </div>

      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-[4.5rem] -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted shadow-sm transition-colors hover:bg-secondary hover:text-foreground"
        >
          {collapsed ? (
            <CaretLineRight size={14} weight="bold" />
          ) : (
            <CaretLineLeft size={14} weight="bold" />
          )}
        </button>
      )}

      <nav
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none",
          collapsed ? "px-2 py-2 space-y-0.5" : "px-3 py-2 space-y-0.5"
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
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center rounded-xl transition-all group",
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                  : "text-muted hover:bg-secondary hover:text-foreground border border-transparent"
              )}
            >
              <Icon size={22} weight="duotone" className="shrink-0" />
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">{item.label}</p>
                    {item.description && (
                      <p className="text-[11px] opacity-70 truncate mt-0.5">{item.description}</p>
                    )}
                  </div>
                  {showEnrollmentBadge && <AdminNavBadge count={enrollmentBadgeCount} />}
                  {active && <CaretRight size={14} weight="bold" className="shrink-0" />}
                </>
              )}
              {collapsed && showEnrollmentBadge && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-border",
          collapsed ? "p-2 space-y-1.5" : "p-3 space-y-1.5"
        )}
      >
        {user.role === "admin" && <AdminRevenueSidebarCard compact={collapsed} />}
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <SignOut size={20} weight="bold" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}
