"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getIntegrationSettings(provider = "close") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_settings")
    .select("*")
    .eq("provider", provider)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore row not found
    console.error("Error fetching integration settings:", error);
    return null;
  }
  return data;
}

export async function updateIntegrationSettings(
  provider: string,
  updates: Record<string, any>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_settings")
    .update(updates)
    .eq("provider", provider)
    .select()
    .single();

  if (error) {
    console.error("Error updating integration settings:", error);
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { data };
}
