"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Columns3,
  MapPin,
  MoreHorizontal,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: Columns3 },
  { label: "Counties", href: "/counties", icon: MapPin },
  { label: "More", href: "/settings", icon: MoreHorizontal },
];

export default function MobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className="mobile-nav-container"
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
              fontSize: "10px",
              fontWeight: active ? 600 : 500,
              color: active ? "var(--accent-blue)" : "var(--text-tertiary)",
              transition: "color var(--transition-fast)",
              padding: "4px 12px",
            }}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <style>{`
        .mobile-nav-container {
          display: none !important;
        }
        @media (max-width: 768px) {
          .mobile-nav-container {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
