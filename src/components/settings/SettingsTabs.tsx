"use client";

import { useState } from "react";
import { User, Shield, Database, Sliders, Bell, Loader2, Link2, RefreshCw, Users } from "lucide-react";
import { updateIntegrationSettings } from "@/app/actions/settings";
import { ScoringSettings } from "./ScoringSettings";
import { TierSettings } from "./TierSettings";
import { UserManagement } from "./UserManagement";
import toast from "react-hot-toast";

type IntegrationSettings = {
  provider: string;
  api_key: string | null;
  sync_enabled: boolean;
  sync_direction: 'push' | 'pull' | 'two-way' | 'off';
  last_sync: string | null;
};

const tabs = [
  { label: "Profile", icon: User },
  { label: "Scoring", icon: Sliders },
  { label: "Tiers", icon: Shield },
  { label: "Users", icon: Users },
  { label: "Integrations", icon: Database },
];

export function SettingsTabs({ initialSettings }: { initialSettings: IntegrationSettings | null }) {
  const [activeTab, setActiveTab] = useState("Profile");

  // Close CRM Config State
  const [apiKey, setApiKey] = useState(initialSettings?.api_key || "");
  const [syncEnabled, setSyncEnabled] = useState(initialSettings?.sync_enabled || false);
  const [syncDirection, setSyncDirection] = useState(initialSettings?.sync_direction || 'off');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast.error("Please enter an API key first.");
      return;
    }
    setTesting(true);
    try {
      const authHeader = btoa(`${apiKey}:`);
      const res = await fetch("https://api.close.com/api/v1/me/", {
        headers: {
          "Authorization": `Basic ${authHeader}`
        }
      });
      if (!res.ok) throw new Error("Invalid API Key");
      const data = await res.json();
      toast.success(`Connected as ${data.first_name} ${data.last_name}`);
    } catch (e: any) {
      toast.error("Connection failed: " + e.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveCloseSettings = async () => {
    setSaving(true);
    const updates = {
      api_key: apiKey,
      sync_enabled: syncEnabled,
      sync_direction: syncDirection
    };
    
    const { error } = await updateIntegrationSettings('close', updates);
    if (error) {
       toast.error(error);
    } else {
       toast.success("Integration settings saved.");
    }
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      {/* Settings sidebar / tabs */}
      <div
        style={{
          width: "220px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.label;

          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: isActive ? "var(--accent-blue-light)" : "transparent",
                border: "none",
                color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition-fast)",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: "320px",
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-primary)",
          padding: "28px",
        }}
      >
        {activeTab === "Profile" && (
           <div className="flex flex-col items-center justify-center h-48 text-[var(--text-tertiary)]">
             <p>Profile management coming soon.</p>
           </div>
        )}

        {activeTab === "Scoring" && <ScoringSettings />}
        {activeTab === "Tiers" && <TierSettings />}
        {activeTab === "Users" && <UserManagement />}

        {activeTab === "Integrations" && (
          <div className="animate-fade-in space-y-8">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <Link2 size={18} /> Close CRM Integration
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Bi-directional sync between Alabama Foreclosure CRM and Close CRM.
              </p>

              {/* Card container */}
              <div className="border border-[var(--border-primary)] rounded-[var(--radius-md)] p-6 bg-white space-y-6">
                
                {/* API Key */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Close API Key</label>
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="api_3x..."
                      className="flex-1 h-10 px-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm focus:border-[var(--accent-blue)] outline-none"
                    />
                    <button 
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="px-4 h-10 bg-[var(--bg-tertiary)] hover:bg-gray-200 border border-[var(--border-primary)] rounded-[var(--radius-md)] text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      {testing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      Test Connection
                    </button>
                  </div>
                </div>

                <hr className="border-[var(--border-primary)]" />

                {/* Sync Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-3">Sync Direction</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="syncDir" value="off" checked={syncDirection === 'off'} onChange={() => setSyncDirection('off')} className="accent-[var(--accent-blue)]" />
                        Off
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="syncDir" value="push" checked={syncDirection === 'push'} onChange={() => setSyncDirection('push')} className="accent-[var(--accent-blue)]" />
                        Push to Close (CRM → Close)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="syncDir" value="pull" checked={syncDirection === 'pull'} onChange={() => setSyncDirection('pull')} className="accent-[var(--accent-blue)]" />
                        Pull from Close (Close → CRM)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="syncDir" value="two-way" checked={syncDirection === 'two-way'} onChange={() => setSyncDirection('two-way')} className="accent-[var(--accent-blue)]" />
                        Two-way Sync
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-3">Global Sync Status</label>
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" className="sr-only peer" 
                        checked={syncEnabled}
                        onChange={(e) => setSyncEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--success)]"></div>
                      <span className="ml-3 text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                        {syncEnabled ? "Sync Active" : "Sync Paused"}
                      </span>
                    </label>

                    <div className="mt-8">
                       <button
                         onClick={handleSaveCloseSettings}
                         disabled={saving}
                         className="px-6 h-10 w-full flex items-center justify-center bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white rounded-[var(--radius-md)] text-sm font-semibold transition-colors shadow-sm"
                       >
                         {saving ? <Loader2 size={16} className="animate-spin" /> : "Save Sync Settings"}
                       </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Mapping Section (UI only for MVP visual tracking) */}
              <div className="mt-8 border border-[var(--border-primary)] rounded-[var(--radius-md)] overflow-hidden bg-white">
                 <div className="bg-[var(--bg-tertiary)] px-4 py-3 border-b border-[var(--border-primary)]">
                    <h3 className="text-sm font-bold text-[var(--text-secondary)] tracking-wider uppercase">Field Data Mapping</h3>
                 </div>
                 <div className="p-4 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead>
                         <tr className="text-[var(--text-tertiary)] border-b border-[var(--border-secondary)]">
                           <th className="pb-2 font-medium">CRM Field</th>
                           <th className="pb-2 font-medium">Close Object.Field</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-[var(--border-secondary)] [&>tr>td]:py-3">
                         <tr><td className="font-medium text-[var(--text-primary)]">property_address</td><td className="text-[var(--text-secondary)]">Lead.address</td></tr>
                         <tr><td className="font-medium text-[var(--text-primary)]">deal_status</td><td className="text-[var(--text-secondary)]">Lead.status_id</td></tr>
                         <tr><td className="font-medium text-[var(--text-primary)]">phone / email</td><td className="text-[var(--text-secondary)]">Contact.phones[] / emails[]</td></tr>
                         <tr><td className="font-medium text-[var(--text-primary)]">Financial Metrics</td><td className="text-[var(--text-secondary)]">Lead.custom_fields</td></tr>
                         <tr><td className="font-medium text-[var(--text-primary)]">Activities (Call/SMS)</td><td className="text-[var(--text-secondary)]">Activity POST endpoints</td></tr>
                       </tbody>
                    </table>
                 </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
