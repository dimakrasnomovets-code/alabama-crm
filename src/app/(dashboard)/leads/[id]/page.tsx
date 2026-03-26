import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ComposeBar } from "@/components/leads/ComposeBar";
import { ActivityTimeline } from "@/components/leads/ActivityTimeline";
import { getActivities } from "@/app/actions/activities";
import { MapPin, User, Calendar, ExternalLink } from "lucide-react";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch lead data
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*, counties(name)")
    .eq("id", id)
    .single();

  if (leadError || !lead) {
    if (leadError?.code !== 'PGRST116') {
      console.error("Error fetching lead:", leadError);
    }
    notFound();
  }

  // Fetch activities
  const activities = await getActivities(id);

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {lead.property_address}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                lead.priority_tier === "Tier 1"
                  ? "bg-emerald-100 text-emerald-800"
                  : lead.priority_tier === "Tier 2"
                  ? "bg-blue-100 text-blue-800"
                  : lead.priority_tier === "Tier 3"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {lead.priority_tier}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {lead.counties?.name || "Unknown County"}
            </span>
            <span>ID: {lead.lead_id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main) - Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <ComposeBar leadId={id} />
          
          <div className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
            Activity Timeline
          </div>
          <ActivityTimeline activities={activities} />
        </div>

        {/* Right Column (Side) - Lead Details */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Deal Pipeline
            </h3>
            <div className="mb-4">
              <label className="block text-xs text-[var(--text-tertiary)] mb-1">Status</label>
              <div className="font-semibold text-[var(--text-primary)] bg-[var(--bg-tertiary)] p-2 rounded border border-[var(--border-primary)]">
                {lead.deal_status}
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1">Zone</label>
              <div className="font-semibold text-[var(--text-primary)] bg-[var(--bg-tertiary)] p-2 rounded border border-[var(--border-primary)]">
                {lead.zone || "Unknown"}
              </div>
            </div>
            {lead.sale_date && (
              <div className="mt-4">
                <label className="block text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Sale Date
                </label>
                <div className="font-semibold text-red-600">
                  {new Date(lead.sale_date).toLocaleDateString()}
                  {lead.days_to_sale != null && ` (${lead.days_to_sale} days)`}
                </div>
              </div>
            )}
          </div>

          {/* Contact Info Card */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Contact Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-1">Borrower</label>
                <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                  <User size={14} />
                  {lead.borrower_name || "Unknown"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs text-[var(--text-tertiary)] mb-1">Occupancy</label>
                  <div className="text-sm">{lead.occupancy}</div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-tertiary)] mb-1">Motivation</label>
                  <div className="text-sm">{lead.motivation}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Financials Card */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Financial Estimate
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-[var(--text-tertiary)]">ARV Est</span>
                <span className="text-sm font-semibold">${Number(lead.arv_estimate || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[var(--text-tertiary)]">Repairs</span>
                <span className="text-sm text-red-500">-${Number(lead.repair_estimate || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[var(--text-tertiary)]">Debt</span>
                <span className="text-sm text-red-500">-${Number(lead.debt_payoff_estimate || 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-[var(--border-primary)] flex justify-between">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Est. Equity</span>
                <span className="text-sm font-bold text-emerald-600">${Number(lead.equity_estimate || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
