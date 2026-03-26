"use server";

import { createClient } from "@/lib/supabase/server";

export async function exportLeadsToCSV(filters?: any) {
  const supabase = await createClient();
  
  let query = supabase
    .from("leads")
    .select(`
      lead_id,
      property_address,
      borrower_name,
      deal_status,
      priority_tier,
      zone,
      total_score,
      arv_estimate,
      equity_estimate,
      sale_date,
      counties(name)
    `);

  // Apply filters if provided (simplified for now)
  if (filters?.county_id) query = query.eq("county_id", filters.county_id);
  if (filters?.deal_status) query = query.eq("deal_status", filters.deal_status);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Export error:", error);
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { error: "No data to export" };
  }

  // Generate CSV string
  const headers = [
    "Lead ID", 
    "Property Address", 
    "Borrower Name", 
    "Status", 
    "Tier", 
    "Zone", 
    "Score", 
    "ARV Est", 
    "Equity Est", 
    "Sale Date", 
    "County"
  ];

  const rows = data.map(lead => [
    lead.lead_id,
    `"${lead.property_address?.replace(/"/g, '""')}"`,
    `"${lead.borrower_name?.replace(/"/g, '""') || ""}"`,
    lead.deal_status,
    lead.priority_tier,
    lead.zone,
    lead.total_score,
    lead.arv_estimate,
    lead.equity_estimate,
    lead.sale_date,
    (Array.isArray(lead.counties) ? lead.counties[0]?.name : (lead.counties as any)?.name) || ""
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  return { csv: csvContent };
}
