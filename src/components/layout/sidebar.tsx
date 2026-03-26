"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSidebar } from "@/components/providers/sidebar-provider";
import {
  LayoutDashboard,
  Users,
  Columns3,
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

interface SidebarProps {
  user: {
    email: string;
    full_name?: string;
    role?: string;
    avatar_url?: string | null;
  } | null;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: Columns3 },
  { label: "Counties", href: "/counties", icon: MapPin },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ user }: SidebarProps) {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/login";
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <aside
      style={{
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "linear-gradient(180deg, #14142B 0%, #0F0F1A 100%)",
        display: "flex",
        flexDirection: "column",
        transition: "width var(--transition-normal)",
        zIndex: 50,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: collapsed ? "20px 12px" : "20px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          minHeight: "72px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #4A90D9, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(74,144,217,0.25)",
          }}
        >
          <Building2 size={18} color="#FFFFFF" />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              AL Foreclosure
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--sidebar-text)",
                whiteSpace: "nowrap",
              }}
            >
              CRM Pipeline
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--sidebar-text-active)" : "var(--sidebar-text)",
                background: active ? "var(--sidebar-active)" : "transparent",
                borderLeft: active ? "3px solid var(--sidebar-accent)" : "3px solid transparent",
                transition: "all var(--transition-fast)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)";
                  (e.currentTarget as HTMLElement).style.color = "#D1D1E9";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)";
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
              {active && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "20px",
                    borderRadius: "0 3px 3px 0",
                    background: "var(--sidebar-accent)",
                    boxShadow: "0 0 8px rgba(74,144,217,0.4)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => toggle()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "40px",
          margin: "0 8px 8px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          color: "var(--sidebar-text)",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* User section */}
      <div
        style={{
          padding: collapsed ? "16px 8px" : "16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #4A90D9, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "12px",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          {initials}
        </div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.full_name || user?.email || "User"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--sidebar-text)",
                  textTransform: "capitalize",
                }}
              >
                {user?.role || "agent"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                background: "transparent",
                border: "none",
                color: "var(--sidebar-text)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(235,87,87,0.15)";
                (e.currentTarget as HTMLElement).style.color = "#EB5757";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)";
              }}
            >
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
