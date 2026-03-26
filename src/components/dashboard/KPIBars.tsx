"use client";

import { Users, AlertTriangle, Activity, DollarSign, LayoutDashboard, Target } from "lucide-react";
import { useRouter } from "next/navigation";

type KPIProps = {
  data: {
    total_leads: number;
    action_due_today: number;
    avg_score: number;
    total_equity: number;
  };
  zones: Record<string, number>;
  tiers: Record<string, number>;
};

export function KPIBars({ data, zones, tiers }: KPIProps) {
  const router = useRouter();

  const handleNavigate = (filterUrl: string) => {
    router.push(filterUrl);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      
      <div 
        onClick={() => handleNavigate("/leads")}
        className="glass-card p-4 cursor-pointer hover:-translate-y-1 transition-transform group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Leads</span>
          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center group-hover:bg-[var(--accent-blue)] group-hover:text-white text-[var(--accent-blue)] transition-colors">
            <Users size={16} />
          </div>
        </div>
        <div className="text-2xl font-bold text-[var(--text-primary)]">{data.total_leads}</div>
      </div>

      <div 
        onClick={() => handleNavigate("/leads?zone=Red")}
        className="glass-card p-4 cursor-pointer hover:-translate-y-1 transition-transform group"
      >
        <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Zones</span>
           <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
             <LayoutDashboard size={14} />
           </div>
        </div>
        <div className="flex gap-2 text-sm mt-3">
           {['Green', 'Yellow', 'Red'].map(z => (
             <div key={z} className="flex flex-col items-center">
               <span className="font-bold">{zones[z] || 0}</span>
               <span className={`w-2 h-2 rounded-full mt-1 ${z === 'Green' ? 'bg-emerald-500' : z === 'Yellow' ? 'bg-orange-400' : 'bg-red-500'}`} />
             </div>
           ))}
        </div>
      </div>

      <div 
        onClick={() => handleNavigate("/leads?tier=Tier%201")}
        className="glass-card p-4 cursor-pointer hover:-translate-y-1 transition-transform group"
      >
        <div className="flex items-center justify-between mb-2">
           <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Top Tiers</span>
           <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600">
             <Target size={14} />
           </div>
        </div>
        <div className="flex gap-4 mt-2">
          <div>
            <div className="text-lg font-bold text-emerald-600">{tiers['Tier 1'] || 0}</div>
             <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Tier 1</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{tiers['Tier 2'] || 0}</div>
             <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Tier 2</div>
          </div>
        </div>
      </div>

      <div 
         onClick={() => handleNavigate("/leads?action=today")}
         className="glass-card p-4 cursor-pointer hover:-translate-y-1 transition-transform group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Due Today</span>
          <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white text-orange-600 transition-colors">
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="text-2xl font-bold text-orange-600">{data.action_due_today}</div>
      </div>

      <div 
         className="glass-card p-4 cursor-default"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Avg Score</span>
          <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Activity size={16} />
          </div>
        </div>
        <div className="text-2xl font-bold text-[var(--text-primary)]">{Number(data.avg_score).toFixed(0)}</div>
      </div>

      <div 
         className="glass-card p-4 cursor-default border-indigo-100 bg-indigo-50/10"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Potential Equity</span>
          <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
            <DollarSign size={16} />
          </div>
        </div>
        <div className="text-2xl font-bold text-indigo-600">
           {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(data.total_equity)}
        </div>
      </div>

    </div>
  );
}
