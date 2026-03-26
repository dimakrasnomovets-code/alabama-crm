import { createClient } from "@/lib/supabase/server";
import { KPIBars } from "@/components/dashboard/KPIBars";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { UpcomingSales } from "@/components/dashboard/UpcomingSales";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { Settings2 } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const range = params.range || "month";

  // Calculate start date based on range
  let startDate = new Date();
  if (range === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (range === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (range === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  } else {
    // All time
    startDate = new Date(0);
  }

  const startDateIso = range !== 'all' ? startDate.toISOString() : null;

  // 1. Fetch Dashboard Stats from RPC
  const { data: statsJson, error: statsError } = await supabase.rpc(
    "get_dashboard_stats",
    { start_date: startDateIso }
  );

  // 2. Fetch Activity Volume from RPC
  const { data: volumeJson, error: volumeError } = await supabase.rpc(
    "get_activity_volume",
    { start_date: startDateIso }
  );

  // 3. Fetch specific Upcoming Sales (Top 6)
  const { data: upcomingSales, error: upcomingError } = await supabase
    .from("leads")
    .select("*, counties(name)")
    .gte("sale_date", new Date().toISOString())
    .order("sale_date", { ascending: true })
    .limit(6);

  if (statsError) console.error("Stats Error:", statsError);
  if (volumeError) console.error("Volume Error:", volumeError);

  const fallbackStats = {
    kpis: { total_leads: 0, action_due_today: 0, avg_score: 0, total_equity: 0 },
    distributions: { zones: {}, tiers: {}, pipeline: {}, counties: {} }
  };

  const parsedStats = statsJson || fallbackStats;
  const parsedVolume = volumeJson || [];

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Live overview of your Alabama foreclosure pipeline
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DateFilter range={range} />
          <button className="h-10 px-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-md)] flex items-center gap-2 text-sm font-semibold hover:border-[var(--border-focus)] transition-colors">
             <Settings2 size={14} /> Customize
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <KPIBars 
        data={parsedStats.kpis} 
        zones={parsedStats.distributions.zones} 
        tiers={parsedStats.distributions.tiers} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <DashboardCharts 
              pipeline={parsedStats.distributions.pipeline}
              zones={parsedStats.distributions.zones}
              tiers={parsedStats.distributions.tiers}
              counties={parsedStats.distributions.counties}
              activityVolume={parsedVolume}
            />
        </div>
        <div className="lg:col-span-1 space-y-6">
           {/* Replace UpcomingSales component passing logic */}
           <UpcomingSales sales={upcomingSales || []} />
        </div>
      </div>

    </div>
  );
}
