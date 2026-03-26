import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { CloseCRMClient } from "@/lib/close-crm";

export async function GET(req: NextRequest) {
  // Verify Cron secret if configured to prevent unauthorized syncs
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get Integration Settings
    const { data: settings } = await supabaseAdmin
      .from("integration_settings")
      .select("*")
      .eq("provider", "close")
      .single();

    if (!settings?.sync_enabled || (settings.sync_direction !== 'pull' && settings.sync_direction !== 'two-way')) {
      return NextResponse.json({ message: 'Sync disabled or direction not set to pull' });
    }

    const closeClient = new CloseCRMClient(settings.api_key);

    // 2. Fetch recently updated leads from Close
    // Note: This is simplified. In a real app, we'd use settings.last_sync
    // Fetch leads updated in the last 24h
    const lastSyncTime = settings.last_sync || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Using simple fetch to get updated leads from Close (simplified query)
    const authHeaderClose = btoa(`${settings.api_key}:`);
    const res = await fetch(`https://api.close.com/api/v1/lead/?query=updated_at > "${lastSyncTime}"`, {
      headers: { "Authorization": `Basic ${authHeaderClose}` }
    });

    if (!res.ok) throw new Error("Failed to fetch leads from Close");
    const { data: closeLeads } = await res.json();

    let syncCount = 0;
    for (const closeLead of closeLeads) {
       // Search for local matching lead by close_crm_lead_id or Alabama Lead ID custom field
       const { data: localLead } = await supabaseAdmin
         .from("leads")
         .select("id, updated_at")
         .eq("close_crm_lead_id", closeLead.id)
         .single();

       if (localLead) {
          const closeUpdatedAt = new Date(closeLead.date_updated).getTime();
          const localUpdatedAt = new Date(localLead.updated_at).getTime();

          if (closeUpdatedAt > localUpdatedAt) {
             await supabaseAdmin
               .from("leads")
               .update({
                 borrower_name: closeLead.contacts?.[0]?.name || "Unknown",
                 deal_status: closeLead.status_label || "New",
                 updated_at: closeLead.date_updated
               })
               .eq("id", localLead.id);
             syncCount++;
          }
       }
    }

    // 3. Update last sync time
    await supabaseAdmin
      .from("integration_settings")
      .update({ last_sync: new Date().toISOString() })
      .eq("provider", "close");

    return NextResponse.json({ success: true, synced: syncCount });
  } catch (error: any) {
    console.error("Close Cron Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
