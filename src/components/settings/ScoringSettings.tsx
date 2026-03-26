"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

export function ScoringSettings() {
  const [config, setConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    const { data, error } = await supabase
      .from("scoring_config")
      .select("*")
      .order("category")
      .order("sort_order");
    
    if (error) {
      toast.error("Failed to load scoring config");
    } else {
      setConfig(data || []);
    }
    setLoading(false);
  }

  async function handleUpdatePoints(id: string, points: number) {
    setConfig(config.map(item => item.id === id ? { ...item, points } : item));
  }

  async function handleSave() {
    setSaving(true);
    for (const item of config) {
      await supabase
        .from("scoring_config")
        .update({ points: item.points })
        .eq("id", item.id);
    }
    toast.success("Scoring configuration saved");
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const categories = Array.from(new Set(config.map(c => c.category)));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Lead Scoring Matrix</h3>
          <p className="text-sm text-[var(--text-secondary)]">Define how many points each lead attribute is worth.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-blue)] text-white rounded-md text-sm font-semibold hover:bg-[var(--accent-blue-hover)] transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <div key={cat} className="border border-[var(--border-primary)] rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="bg-[var(--bg-tertiary)] px-4 py-2 border-b border-[var(--border-primary)]">
               <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{cat}</span>
            </div>
            <div className="p-4 space-y-3">
               {config.filter(c => c.category === cat).map(item => (
                 <div key={item.id} className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.option_value}</span>
                    <input 
                      type="number" 
                      value={item.points}
                      onChange={(e) => handleUpdatePoints(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 px-2 text-sm border border-[var(--border-primary)] rounded bg-[var(--bg-primary)] text-right focus:border-[var(--accent-blue)] outline-none"
                    />
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
