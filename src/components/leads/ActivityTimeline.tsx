"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Phone, MessageSquare, Mail, Edit3, Settings, 
  Info, Calendar, CheckSquare, Voicemail, ArrowUpRight, ArrowDownLeft 
} from "lucide-react";
import { Activity } from "@/app/actions/activities";

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filteredActivities = activities.filter((act) => {
    if (filter === "all") return true;
    if (filter === "calls" && act.activity_type === "call") return true;
    if (filter === "sms" && act.activity_type === "sms") return true;
    if (filter === "email" && act.activity_type === "email") return true;
    if (filter === "notes" && act.activity_type === "note") return true;
    return false;
  });

  const getIcon = (type: string, direction?: string | null) => {
    switch (type) {
      case "call":
        if (direction === "inbound") return <Phone size={14} className="text-emerald-500" />;
        return <Phone size={14} className="text-[var(--accent-blue)]" />;
      case "sms":
        return <MessageSquare size={14} className="text-indigo-500" />;
      case "email":
        return <Mail size={14} className="text-amber-500" />;
      case "note":
        return <Edit3 size={14} className="text-slate-500" />;
      case "status_change":
        return <Settings size={14} className="text-[var(--warning)]" />;
      case "field_change":
        return <Info size={14} className="text-[var(--info)]" />;
      case "voicemail":
        return <Voicemail size={14} className="text-pink-500" />;
      case "meeting":
        return <Calendar size={14} className="text-teal-500" />;
      case "task":
        return <CheckSquare size={14} className="text-[var(--success)]" />;
      default:
        return <Info size={14} className="text-gray-400" />;
    }
  };

  const getBackground = (type: string) => {
    switch (type) {
      case "call": return "bg-blue-50 border-blue-100";
      case "sms": return "bg-indigo-50 border-indigo-100";
      case "email": return "bg-amber-50 border-amber-100";
      case "note": return "bg-slate-50 border-slate-100";
      case "status_change": return "bg-orange-50 border-orange-100";
      case "field_change": return "bg-blue-50 border-blue-100";
      default: return "bg-[var(--bg-tertiary)] border-[var(--border-primary)]";
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 border border-[var(--border-primary)] border-dashed rounded-[var(--radius-lg)]">
        <div className="text-[var(--text-tertiary)] mb-2">No activities yet</div>
        <p className="text-sm text-[var(--text-secondary)]">Use the compose bar above to log your first activity.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--border-primary)] p-4 shadow-sm h-full">
      
      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-[var(--border-primary)]">
        {['all', 'calls', 'sms', 'email', 'notes'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-[var(--accent-blue)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {filteredActivities.map((activity, index) => (
          <div key={activity.id} className="relative flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            
            {/* Timeline Line & Icon */}
            <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center outline outline-4 outline-white z-10 ${getBackground(activity.activity_type)} border`}>
              {getIcon(activity.activity_type, activity.direction)}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <div className="text-sm font-semibold capitalize flex items-center gap-2">
                  {activity.activity_type.replace('_', ' ')}
                  {activity.direction === 'outbound' && <ArrowUpRight size={14} className="text-gray-400" />}
                  {activity.direction === 'inbound' && <ArrowDownLeft size={14} className="text-gray-400" />}
                  <span className="text-xs font-normal text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2 py-0.5 rounded">
                     {activity.users?.full_name || 'System'}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)]" title={format(new Date(activity.created_at), 'PPpp')}>
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className={`text-sm text-[var(--text-primary)] mt-1 rounded-md p-3 border ${getBackground(activity.activity_type)} shadow-sm`}>
                
                {/* Specific Layouts based on type */}
                {['email'].includes(activity.activity_type) && activity.subject && (
                  <div className="font-bold mb-1 pb-1 border-b border-black/5">{activity.subject}</div>
                )}
                
                {activity.activity_type === 'call' && (
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs border-b border-black/5 pb-2">
                    {activity.duration_seconds ? <div><span className="font-semibold">Duration:</span> {Math.floor(activity.duration_seconds/60)}m {activity.duration_seconds%60}s</div> : null}
                    {activity.result && <div><span className="font-semibold">Result:</span> {activity.result}</div>}
                    {activity.spoke_with && <div><span className="font-semibold">Spoke With:</span> {activity.spoke_with}</div>}
                    {activity.owner_motivation && <div><span className="font-semibold">Motivation:</span> {activity.owner_motivation}</div>}
                  </div>
                )}

                {/* Body Content */}
                {activity.body ? (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {activity.body}
                  </div>
                ) : (
                  <span className="italic opacity-50">No notes provided.</span>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
