"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

export function TierSettings() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchTiers();
  }, []);

  async function fetchTiers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tier_thresholds")
      .select("*")
      .order("min_score", { ascending: false });
    
    if (error) {
      toast.error("Failed to load tier thresholds");
    } else {
      setTiers(data || []);
    }
    setLoading(false);
  }

  async function handleUpdateMinScore(id: string, min_score: number) {
    setTiers(tiers.map(t => t.id === id ? { ...t, min_score } : t));
  }

  async function handleSave() {
    setSaving(true);
    for (const tier of tiers) {
      await supabase
        .from("tier_thresholds")
        .update({ min_score: tier.min_score })
        .eq("id", tier.id);
    }
    toast.success("Tier thresholds saved");
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Tier Scoring Thresholds</h3>
        <p className="text-sm text-[var(--text-secondary)]">Leads are automatically tiered based on their total score.</p>
      </div>

      <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden bg-white shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <tr>
              <th className="px-6 py-3 font-bold uppercase tracking-wider">Tier Name</th>
              <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Min Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-secondary)]">
            {tiers.map(tier => (
              <tr key={tier.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      tier.tier_name === 'Tier 1' ? 'bg-emerald-500' : 
                      tier.tier_name === 'Tier 2' ? 'bg-blue-500' :
                      tier.tier_name === 'Tier 3' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    {tier.tier_name}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <input 
                    type="number" 
                    value={tier.min_score}
                    onChange={(e) => handleUpdateMinScore(tier.id, parseInt(e.target.value) || 0)}
                    className="w-20 h-9 px-3 text-sm border border-[var(--border-primary)] rounded bg-[var(--bg-primary)] text-right focus:border-[var(--accent-blue)] outline-none font-bold"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-4 border-t border-[var(--border-secondary)] flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-blue)] text-white rounded-md text-sm font-semibold hover:bg-[var(--accent-blue-hover)] transition-colors shadow-lg"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Thresholds
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-amber-800 text-sm">
        <div className="flex-shrink-0 mt-0.5"><MoreHorizontal size={16} /></div>
        <p>Leads below Tier 3 threshold without an explicit range will default to "Tier 4". Scores are calculated automatically upon lead creation or field updates.</p>
      </div>
    </div>
  );
}
