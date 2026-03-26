import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a lead ID in format AL-XXX-YYYY-NNN
 * XXX = county abbreviation, YYYY = year, NNN = sequence
 */
export function generateLeadId(countyAbbr: string, sequence: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(3, "0");
  return `AL-${countyAbbr.toUpperCase()}-${year}-${seq}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(date: string | Date | null): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Calculate days until sale
 */
export function daysToSale(saleDate: string | Date | null): number | null {
  if (!saleDate) return null;
  return differenceInDays(new Date(saleDate), new Date());
}

/**
 * Format currency
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get zone color based on zone value
 */
export function getZoneColor(zone: string | null): string {
  switch (zone) {
    case "Green": return "var(--zone-green)";
    case "Yellow": return "var(--zone-yellow)";
    case "Red": return "var(--zone-red)";
    case "Post-sale": return "var(--zone-post-sale)";
    default: return "var(--text-tertiary)";
  }
}

/**
 * Get tier color based on tier value
 */
export function getTierColor(tier: string | null): string {
  switch (tier) {
    case "Tier 1": return "var(--tier-1)";
    case "Tier 2": return "var(--tier-2)";
    case "Tier 3": return "var(--tier-3)";
    case "Tier 4": return "var(--tier-4)";
    default: return "var(--text-tertiary)";
  }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    New: { bg: "var(--accent-blue-light)", text: "var(--accent-blue)" },
    Calling: { bg: "var(--warning-light)", text: "var(--warning)" },
    Spoke: { bg: "var(--success-light)", text: "var(--success)" },
    Offer: { bg: "#EDE9FE", text: "#7C3AED" },
    UW: { bg: "#FEF3C7", text: "#D97706" },
    Dead: { bg: "var(--danger-light)", text: "var(--danger)" },
    Won: { bg: "var(--success-light)", text: "var(--success)" },
    Watch: { bg: "#F3F4F6", text: "#6B7280" },
  };
  return colors[status] || { bg: "#F3F4F6", text: "#6B7280" };
}
