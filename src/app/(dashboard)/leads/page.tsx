export const dynamic = "force-dynamic";

import { Users, Plus, Filter } from "lucide-react";
import { ExportButton } from "@/components/leads/ExportButton";

export default function LeadsPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "4px",
            }}
          >
            Leads
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Manage your foreclosure leads pipeline
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              height: "36px",
              padding: "0 14px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "8px",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            <Filter size={14} />
            Filter
          </button>
          <ExportButton />
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              height: "36px",
              padding: "0 14px",
              background: "linear-gradient(135deg, #4A90D9, #5A9FE6)",
              border: "none",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(74,144,217,0.25)",
            }}
          >
            <Plus size={15} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-primary)",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "var(--accent-blue-light)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <Users size={28} color="var(--accent-blue)" />
        </div>
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          No leads yet
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            maxWidth: "400px",
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}
        >
          Start by adding your first foreclosure lead, or import leads from a
          spreadsheet. Leads will appear here organized by priority.
        </p>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "40px",
            padding: "0 20px",
            background: "linear-gradient(135deg, #4A90D9, #5A9FE6)",
            border: "none",
            borderRadius: "10px",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(74,144,217,0.3)",
          }}
        >
          <Plus size={16} />
          Add Your First Lead
        </button>
      </div>
    </div>
  );
}
