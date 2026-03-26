"use client";

import { useState } from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { updateCounty, deleteCounty, markCountyChecked, addCounty, type County } from "@/app/actions/counties";
import { CheckCircle2, Clock, MapPin, Link as LinkIcon, Edit2, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type CountiesTableProps = {
  initialCounties: County[];
};

export function CountiesTable({ initialCounties }: CountiesTableProps) {
  const [counties, setCounties] = useState<County[]>(initialCounties);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [newCountyName, setNewCountyName] = useState("");
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<County>>({});

  const startLoading = (id: string) => setLoadingIds(prev => new Set(prev).add(id));
  const stopLoading = (id: string) => {
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleMarkChecked = async (id: string) => {
    startLoading(id);
    const { data, error } = await markCountyChecked(id);
    if (error) toast.error("Failed to mark checked.");
    else if (data) {
      toast.success("County marked as checked.");
      setCounties(counties.map(c => c.id === id ? data[0] : c));
    }
    stopLoading(id);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    startLoading(id);
    const { data, error } = await updateCounty(id, { is_active: !currentStatus });
    if (error) toast.error("Failed to toggle status.");
    else if (data) setCounties(counties.map(c => c.id === id ? data[0] : c));
    stopLoading(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this county from monitoring?")) return;
    startLoading(id);
    const { error } = await deleteCounty(id);
    if (error) toast.error("Failed to delete.");
    else {
      toast.success("County removed.");
      setCounties(counties.filter(c => c.id !== id));
    }
    stopLoading(id);
  };

  const handleAdd = async () => {
    if (!newCountyName.trim()) return;
    setIsAdding(true);
    const { data, error } = await addCounty(newCountyName.trim());
    if (error) toast.error(error);
    else if (data) {
      toast.success("County added");
      setCounties([...counties, data[0]].sort((a,b) => a.name.localeCompare(b.name)));
      setNewCountyName("");
    }
    setIsAdding(false);
  };

  const startEditing = (county: County) => {
    setEditingId(county.id);
    setEditForm({
      priority: county.priority,
      notice_source_url: county.notice_source_url || "",
      probate_url: county.probate_url || ""
    });
  };

  const saveEditing = async (id: string) => {
    startLoading(id);
    const { data, error } = await updateCounty(id, editForm);
    if (error) {
       toast.error("Failed to update.");
    } else if (data) {
       toast.success("County updated.");
       setCounties(counties.map(c => c.id === id ? data[0] : c));
    }
    setEditingId(null);
    stopLoading(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="New County Name (e.g. Jefferson)" 
          className="px-4 py-2 border rounded border-[var(--border-primary)] text-sm flex-1 max-w-sm"
          value={newCountyName}
          onChange={(e) => setNewCountyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button 
          onClick={handleAdd}
          disabled={isAdding}
          className="flex items-center gap-2 bg-[var(--accent-blue)] text-white px-4 py-2 rounded text-sm font-semibold shadow-sm hover:bg-[var(--accent-blue-hover)] transition-colors"
        >
          {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add County
        </button>
      </div>

      <div className="bg-white border border-[var(--border-primary)] rounded-[var(--radius-lg)] overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)] text-[var(--text-secondary)]">
            <tr>
              <th className="px-6 py-4 font-semibold">County</th>
              <th className="px-6 py-4 font-semibold">Priority</th>
              <th className="px-6 py-4 font-semibold">Source Links</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Checks</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]">
            {counties.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--text-tertiary)]">No counties currently tracked.</td></tr>
            ) : counties.map((county) => {
              const isLoading = loadingIds.has(county.id);
              const isOverdue = county.next_check && isPast(new Date(county.next_check)) && county.is_active;

              return (
                <tr key={county.id} className={`transition-colors hover:bg-[var(--bg-tertiary)] ${isOverdue ? 'bg-red-50/50 hover:bg-red-50' : ''}`}>
                  
                  {/* County Name (Links to Lead View) */}
                  <td className="px-6 py-4">
                    <a href={`/leads?county_id=${county.id}`} className="flex items-center gap-3 group">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isOverdue ? 'bg-red-100' : 'bg-[var(--accent-blue-light)]'}`}>
                        <MapPin size={14} className={isOverdue ? "text-red-500" : "text-[var(--accent-blue)]"} />
                      </div>
                      <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                        {county.name}
                      </span>
                    </a>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4">
                    {editingId === county.id ? (
                      <select 
                        value={editForm.priority}
                        onChange={(e) => setEditForm(prev => ({...prev, priority: e.target.value as any}))}
                        className="p-1 border rounded text-xs"
                      >
                        <option value="Primary">Primary</option>
                        <option value="Secondary">Secondary</option>
                        <option value="Watchlist">Watchlist</option>
                      </select>
                    ) : (
                      <span className={`px-2.5 py-1 rounded text-xs font-medium 
                        ${county.priority === 'Primary' ? 'bg-emerald-100 text-emerald-700' :
                          county.priority === 'Secondary' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {county.priority}
                      </span>
                    )}
                  </td>

                  {/* Sources */}
                  <td className="px-6 py-4">
                    {editingId === county.id ? (
                      <div className="space-y-2">
                        <input 
                          type="url" 
                          placeholder="Notice Source URL" 
                          className="w-full p-1 border rounded text-xs min-w-[200px]"
                          value={editForm.notice_source_url || ""}
                          onChange={(e) => setEditForm(prev => ({...prev, notice_source_url: e.target.value}))}
                        />
                        <input 
                          type="url" 
                          placeholder="Probate/Court URL" 
                          className="w-full p-1 border rounded text-xs min-w-[200px]"
                          value={editForm.probate_url || ""}
                          onChange={(e) => setEditForm(prev => ({...prev, probate_url: e.target.value}))}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 text-xs">
                         {county.notice_source_url ? (
                            <a href={county.notice_source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--accent-blue)] hover:underline">
                              <LinkIcon size={12}/> Notice URL
                            </a>
                         ) : <span className="text-[var(--text-tertiary)]">No Notice URL</span>}
                         {county.probate_url && (
                            <a href={county.probate_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--accent-blue)] hover:underline">
                              <LinkIcon size={12}/> Probate URL
                            </a>
                         )}
                      </div>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleActive(county.id, county.is_active)}
                      disabled={isLoading}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${county.is_active ? 'bg-[var(--success)]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${county.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  {/* Checks logic */}
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1">
                        <div className="text-xs text-[var(--text-secondary)]">
                          Last: {county.last_checked ? formatDistanceToNow(new Date(county.last_checked), { addSuffix: true }) : 'Never'}
                        </div>
                        <div className={`text-xs font-semibold flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
                          Next: {county.next_check ? formatDistanceToNow(new Date(county.next_check), { addSuffix: true }) : 'Not scheduled'}
                          {isOverdue && <Clock size={12} />}
                        </div>
                     </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {editingId === county.id ? (
                         <div className="flex gap-2">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Cancel</button>
                            <button onClick={() => saveEditing(county.id)} disabled={isLoading} className="px-3 py-1 bg-[var(--accent-blue)] text-white rounded text-xs hover:bg-[var(--accent-blue-hover)]">Save</button>
                         </div>
                       ) : (
                         <>
                          {county.is_active && (
                            <button
                              onClick={() => handleMarkChecked(county.id)}
                              disabled={isLoading}
                              title="Mark Checked Today"
                              className="w-8 h-8 rounded flex items-center justify-center text-[var(--success)] hover:bg-[var(--success-light)] transition-colors"
                            >
                              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            </button>
                          )}
                          <button
                            onClick={() => startEditing(county)}
                            disabled={isLoading}
                            className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-black transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(county.id)}
                            disabled={isLoading}
                            className="w-8 h-8 rounded flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                         </>
                       )}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
