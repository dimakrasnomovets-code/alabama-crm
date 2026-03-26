"use client";

import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

type ChartsProps = {
  pipeline: Record<string, number>;
  zones: Record<string, number>;
  tiers: Record<string, number>;
  counties: Record<string, number>;
  activityVolume: any[];
};

export function DashboardCharts({ pipeline, zones, tiers, counties, activityVolume }: ChartsProps) {

  // Format data for Recharts
  const pipelineData = [
    { name: 'New', count: pipeline['New'] || 0 },
    { name: 'Calling', count: pipeline['Calling'] || 0 },
    { name: 'Spoke', count: pipeline['Spoke'] || 0 },
    { name: 'Offer', count: pipeline['Offer'] || 0 },
    { name: 'UW', count: pipeline['UW'] || 0 },
    { name: 'Won', count: pipeline['Won'] || 0 },
  ];

  const zoneData = Object.keys(zones).map(key => ({ name: key, value: zones[key] }));
  const zoneColors: Record<string, string> = {
    'Green': '#10B981', // emerald-500
    'Yellow': '#F59E0B', // amber-500
    'Red': '#EF4444', // red-500
    'Post-sale': '#6B7280', // gray-500
    'Unzoned': '#E5E7EB'
  };

  const tierData = Object.keys(tiers).map(key => ({ name: key, value: tiers[key] }));
  const tierColors: Record<string, string> = {
    'Tier 1': '#059669', // emerald-600
    'Tier 2': '#2563EB', // blue-600
    'Tier 3': '#D97706', // amber-600
    'Tier 4': '#DC2626', // red-600
    'Un-tiered': '#9CA3AF'
  };

  const countyData = Object.keys(counties).map(key => ({ name: key, count: counties[key] }));

  // Transform activity Volume if needed 
  // format: [{ date_val: '2023-01-01', activity_type: 'call', count_val: 3 }, ...]
  const transformedVolume: Record<string, any> = {};
  activityVolume.forEach(v => {
    if (!transformedVolume[v.date_val]) {
      transformedVolume[v.date_val] = { date: v.date_val, call: 0, sms: 0, note: 0, email: 0 };
    }
    transformedVolume[v.date_val][v.activity_type] = v.count_val;
  });
  const lineData = Object.values(transformedVolume).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pipeline Funnel */}
        <div className="glass-card p-5 h-80">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Pipeline Status</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip cursor={{fill: 'var(--bg-tertiary)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-primary)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Volume Line */}
        <div className="glass-card p-5 h-80">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Activity Output</h3>
           <ResponsiveContainer width="100%" height="85%">
             <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-secondary)" />
               <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6B7280'}} tickLine={false} axisLine={false} />
               <YAxis tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
               <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
               <Legend wrapperStyle={{ fontSize: '12px' }}/>
               <Line type="monotone" dataKey="call" stroke="var(--accent-blue)" strokeWidth={2} dot={false} />
               <Line type="monotone" dataKey="sms" stroke="#8B5CF6" strokeWidth={2} dot={false} />
               <Line type="monotone" dataKey="note" stroke="#10B981" strokeWidth={2} dot={false} />
               <Line type="monotone" dataKey="email" stroke="#F59E0B" strokeWidth={2} dot={false} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Zones Donut */}
        <div className="glass-card p-5 h-72">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Zone Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={zoneData} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="80%" paddingAngle={2}>
                {zoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={zoneColors[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} iconType="circle"/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tiers Donut */}
        <div className="glass-card p-5 h-72">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Tier Focus</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={tierData} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="80%" paddingAngle={2}>
                {tierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={tierColors[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} iconType="circle"/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* County Bar */}
        <div className="glass-card p-5 h-72">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Counties</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={countyData} margin={{ top: 0, right: 30, left: 0, bottom: 20 }}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{fontSize: 10}} axisLine={false} tickLine={false} interval={0} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'var(--bg-tertiary)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-primary)', boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)' }}/>
              <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
