import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Build user profile object for sidebar/topbar
  const userProfile = {
    email: user.email || "",
    full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
    role: user.user_metadata?.role || "agent",
    avatar_url: user.user_metadata?.avatar_url || null,
  };

  return <DashboardShell user={userProfile}>{children}</DashboardShell>;
}
