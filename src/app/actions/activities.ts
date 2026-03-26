"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getIntegrationSettings } from "./settings";
import { CloseCRMClient } from "@/lib/close-crm";

export type Activity = {
  id: string;
  lead_id: string;
  user_id: string | null;
  activity_type: string;
  direction: string | null;
  channel: string | null;
  subject: string | null;
  body: string | null;
  result: string | null;
  spoke_with: string | null;
  offer_ask: string | null;
  owner_motivation: string | null;
  follow_up_date: string | null;
  next_step: string | null;
  duration_seconds: number | null;
  metadata: any;
  created_at: string;
  users?: {
    full_name: string;
    avatar_url: string | null;
  };
};

export async function getActivities(leadId: string): Promise<Activity[]> {
  const supabase = await createClient();

  // if leadId is not a UUID, we need to maybe look it up (AL-XXX-YYYY)
  // But usually we route by the table's UUID to avoid ambiguity, let's assume UUID for now.
  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      users:user_id(full_name, avatar_url)
    `)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching activities", error);
    return [];
  }

  return data as Activity[];
}

export async function createActivity(
  leadId: string,
  activityType: string,
  payload: Partial<Activity>
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const activityData = {
    ...payload,
    lead_id: leadId,
    activity_type: activityType,
    user_id: userData.user?.id || null,
  };

  const { data, error } = await supabase
    .from("activities")
    .insert([activityData])
    .select()
    .single();

  if (error) {
    console.error("Error creating activity:", error);
    return { error: error.message };
  }

  // Push to Close CRM if enabled
  const settings = await getIntegrationSettings("close");
  if (settings?.sync_enabled && (settings.sync_direction === 'push' || settings.sync_direction === 'two-way')) {
    try {
      const { data: lead } = await supabase
        .from("leads")
        .select("close_crm_lead_id, property_address, borrower_name")
        .eq("id", leadId)
        .single();

      if (lead) {
        const closeClient = new CloseCRMClient(settings.api_key);
        let closeLeadId = lead.close_crm_lead_id;

        // If no Close Lead ID, we need to push the lead first
        if (!closeLeadId) {
           const leadData = await supabase.from("leads").select("*").eq("id", leadId).single();
           if (leadData.data) {
             const closeLead = await closeClient.pushLead(leadData.data);
             closeLeadId = closeLead.id;
             await supabase.from("leads").update({ close_crm_lead_id: closeLeadId }).eq("id", leadId);
           }
        }

        if (closeLeadId) {
          const closeActivity = await closeClient.pushActivity(data, closeLeadId);
          await supabase
            .from("activities")
            .update({ close_crm_activity_id: closeActivity.id })
            .eq("id", data.id);
        }
      }
    } catch (pushError) {
      console.error("Failed to push activity to Close CRM:", pushError);
      // We don't fail the whole action if sync fails, but we could log it.
    }
  }

  // Update lead last_contact_date for human interactions
  if (['call', 'sms', 'email', 'meeting'].includes(activityType)) {
    await supabase
      .from("leads")
      .update({ last_contact_date: new Date().toISOString() })
      .eq("id", leadId);
  }

  revalidatePath(`/leads/${leadId}`);
  return { data };
}
