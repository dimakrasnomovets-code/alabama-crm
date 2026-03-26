"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getIntegrationSettings } from "./settings";
import { CloseCRMClient } from "@/lib/close-crm";

export async function updateLead(leadId: string, updates: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", leadId)
    .select()
    .single();

  if (error) {
    console.error("Error updating lead:", error);
    return { error: error.message };
  }

  // Sync to Close CRM if enabled
  const settings = await getIntegrationSettings("close");
  if (settings?.sync_enabled && (settings.sync_direction === 'push' || settings.sync_direction === 'two-way')) {
    try {
      const closeClient = new CloseCRMClient(settings.api_key);
      const closeLead = await closeClient.pushLead(data);
      
      if (!data.close_crm_lead_id) {
        await supabase
          .from("leads")
          .update({ close_crm_lead_id: closeLead.id })
          .eq("id", leadId);
      }
    } catch (pushError) {
      console.error("Failed to sync lead update to Close CRM:", pushError);
    }
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return { data };
}

export async function createLead(leadData: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .insert([leadData])
    .select()
    .single();

  if (error) {
    console.error("Error creating lead:", error);
    return { error: error.message };
  }

  // Sync to Close CRM if enabled
  const settings = await getIntegrationSettings("close");
  if (settings?.sync_enabled && (settings.sync_direction === 'push' || settings.sync_direction === 'two-way')) {
    try {
      const closeClient = new CloseCRMClient(settings.api_key);
      const closeLead = await closeClient.pushLead(data);
      
      await supabase
        .from("leads")
        .update({ close_crm_lead_id: closeLead.id })
        .eq("id", data.id);
    } catch (pushError) {
      console.error("Failed to sync new lead to Close CRM:", pushError);
    }
  }

  revalidatePath("/leads");
  return { data };
}

export async function searchLeads(query: string) {
  if (!query || query.length < 2) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("id, lead_id, property_address, borrower_name, deal_status")
    .or(`property_address.ilike.%${query}%,borrower_name.ilike.%${query}%,lead_id.ilike.%${query}%`)
    .limit(8);

  if (error) {
    console.error("Error searching leads:", error);
    return [];
  }

  return data;
}

