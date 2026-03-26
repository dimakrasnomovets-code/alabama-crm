import { CountiesTable } from "@/components/counties/CountiesTable";
import { getCounties } from "@/app/actions/counties";
import { Plus } from "lucide-react";

export default async function CountiesPage() {
  const counties = await getCounties();

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
            Counties
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Manage monitored counties, priorities, and inspection schedules.
          </p>
        </div>
      </div>

      <CountiesTable initialCounties={counties} />
    </div>
  );
}
