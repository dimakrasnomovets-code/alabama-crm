"use client";

import { format } from "date-fns";
import { ArrowRight, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export function UpcomingSales({ sales }: { sales: any[] }) {
  const router = useRouter();

  if (!sales || sales.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-[var(--text-tertiary)] py-12">
        <p className="text-sm">No upcoming sales scheduled</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-[var(--border-primary)] flex justify-between items-center">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Upcoming Sales
        </h3>
        <button 
          onClick={() => router.push("/leads?has_sale_date=true")}
          className="text-xs text-[var(--accent-blue)] hover:underline flex items-center gap-1"
        >
          View All
          <ArrowRight size={12} />
        </button>
      </div>
      <div className="divide-y divide-[var(--border-primary)]">
        {sales.map((sale) => {
           const saleDate = new Date(sale.sale_date);
           return (
             <div 
               key={sale.id}
               onClick={() => router.push(`/leads/${sale.id}`)}
               className="p-4 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors flex items-center justify-between"
             >
               <div className="flex gap-4 items-center">
                 <div className="bg-orange-50 text-orange-600 border border-orange-100 rounded-md p-2 w-16 flex flex-col items-center justify-center">
                   <span className="text-xs font-bold uppercase">{format(saleDate, 'MMM')}</span>
                   <span className="text-lg font-black leading-none">{format(saleDate, 'dd')}</span>
                 </div>
                 <div>
                   <div className="font-semibold text-[var(--text-primary)] mb-1">
                     {sale.property_address}
                   </div>
                   <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <MapPin size={12}/> {sale.counties?.name || 'Unknown County'}
                      <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">{sale.deal_status}</span>
                   </div>
                 </div>
               </div>
               <div className="text-right">
                  <div className="text-sm font-bold text-indigo-600 mb-1">
                     ${Number(sale.equity_estimate || 0).toLocaleString()} <span className="text-[10px] font-normal text-indigo-400">EQ</span>
                  </div>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${sale.days_to_sale <= 7 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                     {sale.days_to_sale} Days
                  </div>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}
