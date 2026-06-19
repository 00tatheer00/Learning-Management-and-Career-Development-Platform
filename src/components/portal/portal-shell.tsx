"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  List,
  X,
  SignOut,
  House,
  CaretRight,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PORTAL_COLORS, PORTAL_LABELS, PORTAL_NAV } from "@/lib/constants/portal-nav";
import { SiteLogo } from "@/components/shared/site-logo";
import { PortalAvatar } from "@/components/portal/portal-avatar";
import type { PortalUser } from "@/types/portal";
import { cn } from "@/lib/utils";

interface PortalShellProps {
  user: PortalUser;
  children: React.ReactNode;
}

export function PortalShell({ user, children }: PortalShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = PORTAL_NAV[user.role];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 border-r border-border bg-background z-40">
        <SidebarContent
          user={user}
          navItems={navItems}
          pathname={pathname}
          onLogout={handleLogout}
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
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
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
}: {
  user: PortalUser;
  navItems: (typeof PORTAL_NAV)["student"];
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const gradient = PORTAL_COLORS[user.role];

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-5 bg-gradient-to-br text-white", gradient)}>
        <div className="flex items-center justify-between mb-4">
          <SiteLogo variant="portal" href="/" onDark />
          {onNavigate && (
            <button type="button" onClick={onNavigate} className="p-1 rounded-lg hover:bg-white/20">
              <X size={20} weight="bold" />
            </button>
          )}
        </div>
        <p className="text-xs opacity-80 uppercase tracking-wider mb-3">
          {PORTAL_LABELS[user.role]}
        </p>
        <div className="flex items-center gap-3">
          <PortalAvatar
            name={user.name}
            avatarUrl={user.avatarUrl}
            avatarInitials={user.avatarInitials}
          />
          <div className="min-w-0">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs opacity-80 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all group",
                active
                  ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                  : "text-muted hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon size={22} weight="duotone" />
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base">{item.label}</p>
                {item.description && (
                  <p className="text-xs opacity-70 truncate hidden xl:block">{item.description}</p>
                )}
              </div>
              {active && <CaretRight size={16} weight="bold" className="shrink-0" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <SignOut size={20} weight="bold" />
          Logout
        </button>
      </div>
    </div>
  );
}
