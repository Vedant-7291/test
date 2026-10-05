import type { LeadSource, LeadStatus } from "@/lib/types";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/lead-labels";

const STATUS_CLASS: Record<LeadStatus, string> = {
  new: "bg-emerald-50 text-emerald-800",
  contacted: "bg-lime-50 text-lime-800",
  "demo-booked": "bg-teal-50 text-teal-800",
  enrolled: "bg-green-100 text-green-900",
  lost: "bg-zinc-100 text-zinc-600",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function SourceBadge({ source }: { source: LeadSource }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        source === "chatbot"
          ? "bg-white text-emerald-700 ring-1 ring-emerald-200"
          : "bg-white text-zinc-600 ring-1 ring-zinc-200"
      }`}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}
