import { getIntegrationSettings } from "@/app/actions/settings";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default async function SettingsPage() {
  const closeSettings = await getIntegrationSettings("close");

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Manage your account and CRM configuration
        </p>
      </div>

      <SettingsTabs initialSettings={closeSettings} />
    </div>
  );
}
