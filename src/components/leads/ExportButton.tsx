"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { exportLeadsToCSV } from "@/app/actions/export";
import toast from "react-hot-toast";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportLeadsToCSV();
      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `alabama_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Export complete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
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
      {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      Export
    </button>
  );
}
