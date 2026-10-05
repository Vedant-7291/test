"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/lead-labels";
import { SourceBadge } from "@/components/crm/StatusBadge";

const COLUMNS: LeadStatus[] = [
  "new",
  "contacted",
  "demo-booked",
  "enrolled",
  "lost",
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/crm/leads")
      .then((res) => res.json())
      .then((data) => setLeads(data.leads || []));
  }, []);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c, [] as Lead[]])) as Record<
      LeadStatus,
      Lead[]
    >;
    for (const lead of leads) map[lead.status].push(lead);
    return map;
  }, [leads]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900">Pipeline</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Move counselling work from first enquiry through enrolment.
      </p>
      <div className="mt-6 grid gap-4 overflow-x-auto pb-4 xl:grid-cols-5">
        {COLUMNS.map((status) => (
          <div
            key={status}
            className="min-w-[220px] rounded-xl border border-emerald-100 bg-white"
          >
            <div className="border-b border-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-800">
              {STATUS_LABELS[status]} ({grouped[status].length})
            </div>
            <div className="space-y-2 p-3">
              {grouped[status].map((lead) => (
                <Link
                  key={lead.id}
                  href={`/crm/leads/${lead.id}`}
                  className="block rounded-lg border border-emerald-50 bg-[#f7fdf9] p-3 hover:border-emerald-200"
                >
                  <p className="text-sm font-medium text-zinc-900">{lead.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{lead.grade}</p>
                  <div className="mt-2">
                    <SourceBadge source={lead.source} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
