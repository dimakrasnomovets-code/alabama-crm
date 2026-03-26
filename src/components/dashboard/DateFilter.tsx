"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export function DateFilter({ range }: { range: string }) {
  const router = useRouter();

  return (
    <div className="relative inline-flex bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[var(--radius-md)] items-center px-4 py-2 hover:border-[var(--border-focus)] transition-colors">
      <Calendar size={14} className="text-[var(--text-secondary)] mr-2" />
      <select 
        value={range} 
        onChange={(e) => router.push(`/?range=${e.target.value}`)}
        className="bg-transparent text-sm font-semibold outline-none text-[var(--text-primary)] cursor-pointer"
      >
        <option value="week">Past 7 Days</option>
        <option value="month">Past 30 Days</option>
        <option value="year">Running 12 Months</option>
        <option value="all">All Time</option>
      </select>
    </div>
  );
}
