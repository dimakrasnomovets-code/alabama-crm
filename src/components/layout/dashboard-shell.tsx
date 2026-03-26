"use client";

import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileNav from "@/components/layout/mobile-nav";
import { SidebarProvider, useSidebar } from "@/components/providers/sidebar-provider";

interface DashboardShellProps {
  user: {
    email: string;
    full_name?: string;
    role?: string;
    avatar_url?: string | null;
  };
  children: React.ReactNode;
}

function DashboardContent({ user, children }: DashboardShellProps) {
  const { collapsed } = useSidebar();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar — hidden on mobile */}
      <div className="sidebar-wrapper">
        <Sidebar user={user} />
      </div>

      {/* Main area */}
      <div
        className="main-content-wrapper"
        style={{
          flex: 1,
          marginLeft: collapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
          transition: "margin-left var(--transition-normal)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <TopBar user={user} />

        <main
          style={{
            flex: 1,
            padding: "24px",
            background: "var(--bg-primary)",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile nav */}
      <MobileNav />

      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrapper {
            display: none !important;
          }
          .main-content-wrapper {
            margin-left: 0 !important;
            padding-bottom: 72px;
          }
        }
      `}</style>
    </div>
  );
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardContent user={user}>{children}</DashboardContent>
    </SidebarProvider>
  );
}
