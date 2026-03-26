"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  FileText,
  MapPin,
  Clock,
  Check,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { searchLeads } from "@/app/actions/leads";
import { getNotifications, markAsRead, markAllAsRead, type Notification } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface TopBarProps {
  user: {
    email: string;
    full_name?: string;
    role?: string;
  } | null;
}

export default function TopBar({ user }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ⌘+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch Notifications
  useEffect(() => {
    if (user) {
      getNotifications().then(setNotifications);
    }
  }, [user]);

  // Handle live search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLeads(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/login";
  }

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <>
      <header
        style={{
          height: "var(--topbar-height)",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Search trigger */}
        <button
          onClick={() => {
            setSearchOpen(true);
            setTimeout(() => searchRef.current?.focus(), 50);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            height: "36px",
            padding: "0 14px",
            background: "var(--bg-primary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "8px",
            color: "var(--text-tertiary)",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            minWidth: "240px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-focus)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-primary)";
          }}
        >
          <Search size={14} />
          <span>Search leads...</span>
          <kbd
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 6px",
              background: "var(--bg-secondary)",
              borderRadius: "4px",
              border: "1px solid var(--border-primary)",
              color: "var(--text-tertiary)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Quick Add */}
          <button
            onClick={() => toast("New lead form coming soon!", { icon: "🏠" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              height: "34px",
              padding: "0 14px",
              background: "linear-gradient(135deg, #4A90D9, #5A9FE6)",
              border: "none",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              boxShadow: "0 2px 8px rgba(74,144,217,0.25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 12px rgba(74,144,217,0.35)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 2px 8px rgba(74,144,217,0.25)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <Plus size={15} />
            <span className="hide-mobile">New Lead</span>
          </button>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: notifOpen ? "var(--bg-primary)" : "transparent",
                border: "1px solid var(--border-primary)",
                color: notifOpen ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!notifOpen) {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-primary)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!notifOpen) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <Bell size={16} />
              {/* Unread badge */}
              {unreadCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    minWidth: "16px",
                    height: "16px",
                    borderRadius: "10px",
                    background: "var(--danger)",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    border: "2px solid var(--bg-secondary)",
                  }}
                >
                  {unreadCount}
                </div>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div
                className="animate-fade-in"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  width: "320px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "10px",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "440px",
                }}
              >
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Notifications</span>
                   {unreadCount > 0 && (
                     <button 
                       onClick={async () => {
                         await markAllAsRead();
                         setNotifications(notifications.map(n => ({...n, is_read: true})));
                       }}
                       style={{ fontSize: "12px", color: "var(--accent-blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                     >
                       Mark all as read
                     </button>
                   )}
                </div>

                <div style={{ overflowY: "auto", flex: 1 }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>
                       <Bell size={24} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                       No notifications yet.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        onClick={async () => {
                          if (!notif.is_read) {
                            await markAsRead(notif.id);
                            setNotifications(notifications.map(n => n.id === notif.id ? {...n, is_read: true} : n));
                          }
                          if (notif.link) {
                            router.push(notif.link);
                            setNotifOpen(false);
                          }
                        }}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--border-secondary)",
                          cursor: "pointer",
                          background: notif.is_read ? "transparent" : "var(--bg-tertiary)",
                          transition: "background 150ms",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-primary)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = notif.is_read ? "transparent" : "var(--bg-tertiary)"; }}
                      >
                        {!notif.is_read && <div style={{ position: "absolute", left: "6px", top: "18px", width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent-blue)" }} />}
                        <div style={{ display: "flex", gap: "10px" }}>
                           <div style={{ marginTop: "2px" }}>
                              {notif.type === 'warning' ? <AlertTriangle size={14} color="var(--warning)" /> : 
                               notif.type === 'error' ? <AlertTriangle size={14} color="var(--danger)" /> :
                               notif.type === 'success' ? <Check size={14} color="var(--success)" /> :
                               <Info size={14} color="var(--accent-blue)" />}
                           </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{notif.title}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{notif.message}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Clock size={10} /> {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                              </div>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: "10px", borderTop: "1px solid var(--border-secondary)", textAlign: "center" }}>
                   <button style={{ width: "100%", padding: "6px", fontSize: "12px", color: "var(--text-secondary)", background: "var(--bg-tertiary)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>
                      View all alerts
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: "34px",
                padding: "0 8px 0 4px",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid var(--border-primary)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #4A90D9, #7C3AED)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                {initials}
              </div>
              <ChevronDown size={12} color="var(--text-tertiary)" />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                className="animate-fade-in"
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  width: "220px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "10px",
                  boxShadow: "var(--shadow-lg)",
                  padding: "6px",
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--border-secondary)",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {user?.full_name || user?.email}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "capitalize" }}>
                    {user?.role || "agent"}
                  </div>
                </div>

                <button
                  onClick={() => { router.push("/settings"); setMenuOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-primary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <User size={14} />
                  Profile
                </button>

                <button
                  onClick={() => { router.push("/settings"); setMenuOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-primary)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Settings size={14} />
                  Settings
                </button>

                <div style={{ height: "1px", background: "var(--border-secondary)", margin: "4px 0" }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "var(--danger)",
                    fontSize: "13px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--danger-light)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Overlay / Command Palette */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "120px",
          }}
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <div
            className="animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "560px",
              background: "var(--bg-secondary)",
              borderRadius: "14px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              border: "1px solid var(--border-primary)",
              overflow: "hidden",
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-secondary)",
              }}
            >
              <Search size={18} color="var(--text-tertiary)" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, addresses, borrowers..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "15px",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-primary)",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Results area */}
            <div style={{ padding: "8px", maxHeight: "400px", overflowY: "auto" }}>
              {!searchQuery ? (
                <div style={{ padding: "40 px", textAlign: "center" }}>
                  <Search size={32} style={{ margin: "0 auto 12px", color: "var(--border-primary)" }} />
                  <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                    Type to search leads by address, borrower name, or ID
                  </p>
                </div>
              ) : isSearching ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                   <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "var(--accent-blue)" }} />
                </div>
              ) : searchResults.length === 0 ? (
                 <div style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>
                    No leads found matching "{searchQuery}"
                 </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                   <div style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Matched Leads ({searchResults.length})
                   </div>
                   {searchResults.map(lead => (
                     <button
                       key={lead.id}
                       onClick={() => {
                         router.push(`/leads/${lead.id}`);
                         setSearchOpen(false);
                         setSearchQuery("");
                       }}
                       style={{
                         display: "flex",
                         alignItems: "center",
                         gap: "12px",
                         padding: "10px 12px",
                         borderRadius: "8px",
                         background: "transparent",
                         border: "none",
                         width: "100%",
                         cursor: "pointer",
                         textAlign: "left",
                         transition: "background 150ms",
                       }}
                       onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-tertiary)"; }}
                       onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                     >
                        <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "var(--accent-blue-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-blue)" }}>
                           <MapPin size={16} style={{margin: "auto"}} />
                        </div>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{lead.property_address}</div>
                           <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{lead.borrower_name || "Unknown"} • {lead.lead_id}</div>
                        </div>
                        <div style={{ fontSize: "11px", padding: "2px 6px", background: "var(--bg-tertiary)", borderRadius: "4px", color: "var(--text-tertiary)" }}>
                           {lead.deal_status}
                        </div>
                     </button>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
