"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type County = {
  id: string;
  name: string;
  priority: "Primary" | "Secondary" | "Watchlist";
  notice_source_url: string | null;
  local_paper_url: string | null;
  probate_url: string | null;
  is_active: boolean;
  last_checked: string | null;
  next_check: string | null;
};

export async function getCounties(): Promise<County[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("counties")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching counties:", error);
    return [];
  }
  return data as County[];
}

export async function addCounty(
  name: string,
  priority: County["priority"] = "Watchlist"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("counties")
    .insert([{ name, priority, is_active: true }])
    .select();

  if (error) {
    console.error("Error adding county:", error);
    return { error: error.message };
  }

  revalidatePath("/counties");
  return { data };
}

export async function updateCounty(
  id: string,
  updates: Partial<County>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("counties")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating county:", error);
    return { error: error.message };
  }

  revalidatePath("/counties");
  return { data };
}

export async function deleteCounty(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("counties")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting county:", error);
    return { error: error.message };
  }

  revalidatePath("/counties");
  return { success: true };
}

export async function markCountyChecked(id: string) {
  const supabase = await createClient();
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const updates = {
    last_checked: now.toISOString(),
    next_check: tomorrow.toISOString(),
  };

  const { data, error } = await supabase
    .from("counties")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error marking county checked:", error);
    return { error: error.message };
  }

  revalidatePath("/counties");
  return { data };
}
