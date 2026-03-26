import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { event, action, data } = payload;

    // Use service role key to bypass RLS for webhook sync
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (event === 'lead') {
      if (action === 'updated' || action === 'created') {
         // Sync Lead data
         const closeLeadId = data.id;
         const { data: leadRecord } = await supabaseAdmin
           .from("leads")
           .select("id, updated_at")
           .eq("close_crm_lead_id", closeLeadId)
           .single();

         if (leadRecord) {
            // Last-write-wins resolution (very basic)
            // If Close updated_at is more recent than our updated_at, we update.
            // Close provides updated_at in ISO format.
            const closeUpdatedAt = new Date(data.date_updated).getTime();
            const localUpdatedAt = new Date(leadRecord.updated_at).getTime();

            if (closeUpdatedAt > localUpdatedAt) {
               await supabaseAdmin
                 .from("leads")
                 .update({
                   borrower_name: data.contacts?.[0]?.name || "Unknown",
                   deal_status: data.status_label || "New", // Close status label
                   property_address: data.addresses?.[0]?.address_1 || data.name,
                   // Note: Mapping custom fields is more complex, requiring a fetching the schema first
                   // For MVP, we stick to core fields
                 })
                 .eq("id", leadRecord.id);
            }
         }
      }
    } else if (event === 'activity.call' || event === 'activity.note' || event === 'activity.sms' || event === 'activity.email') {
       if (action === 'created') {
          // Check if activity already exists
          const closeActivityId = data.id;
          const { data: existing } = await supabaseAdmin
            .from("activities")
            .select("id")
            .eq("close_crm_activity_id", closeActivityId)
            .single();

          if (!existing) {
             // Find matching lead
             const closeLeadId = data.lead_id;
             const { data: lead } = await supabaseAdmin
               .from("leads")
               .select("id")
               .eq("close_crm_lead_id", closeLeadId)
               .single();

             if (lead) {
                let activityType = 'note';
                if (event.includes('call')) activityType = 'call';
                else if (event.includes('sms')) activityType = 'sms';
                else if (event.includes('email')) activityType = 'email';

                await supabaseAdmin
                  .from("activities")
                  .insert([{
                    lead_id: lead.id,
                    activity_type: activityType,
                    body: data.note || data.text || data.body_text || "",
                    direction: data.direction || 'outbound',
                    close_crm_activity_id: closeActivityId,
                    created_at: data.date_created
                  }]);
             }
          }
       }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Close Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
