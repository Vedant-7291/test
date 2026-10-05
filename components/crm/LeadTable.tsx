"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/format-date";
import type { Lead, LeadSource, LeadStatus } from "@/lib/types";
import { SourceBadge, StatusBadge } from "./StatusBadge";

type Props = {
  title: string;
  subtitle: string;
  defaultStatus?: LeadStatus | "all";
  defaultSource?: LeadSource | "all";
  demoOnly?: boolean;
};

export function LeadTable({
  title,
  subtitle,
  defaultStatus = "all",
  defaultSource = "all",
  demoOnly = false,
}: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(defaultStatus);
  const [source, setSource] = useState(defaultSource);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (source !== "all") params.set("source", source);
    if (q.trim()) params.set("q", q.trim());
    setLoading(true);
    fetch(`/api/crm/leads?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setLeads(data.leads || []))
      .finally(() => setLoading(false));
  }, [q, status, source]);

  const rows = useMemo(() => {
    if (!demoOnly) return leads;
    return leads.filter((l) => l.demo.toLowerCase().includes("demo"));
  }, [demoOnly, leads]);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, subject..."
          className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring-2 md:max-w-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus | "all")}
          className="rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="demo-booked">Demo booked</option>
          <option value="enrolled">Enrolled</option>
          <option value="lost">Lost</option>
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as LeadSource | "all")}
          className="rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All sources</option>
          <option value="chatbot">WhatsApp chatbot</option>
          <option value="sample">Sample data</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-emerald-50/80 text-xs uppercase tracking-wide text-emerald-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Class / Goal</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-zinc-500" colSpan={5}>
                  Loading leads...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-zinc-500" colSpan={5}>
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              rows.map((lead) => (
                <tr key={lead.id} className="border-t border-emerald-50 hover:bg-emerald-50/40">
                  <td className="px-4 py-3">
                    <Link href={`/crm/leads/${lead.id}`} className="font-medium text-emerald-800 hover:underline">
                      {lead.name}
                    </Link>
                    <p className="text-xs text-zinc-500">+{lead.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {lead.grade}
                    <p className="text-xs text-zinc-500">{lead.goal}</p>
                  </td>
                  <td className="px-4 py-3">
                    <SourceBadge source={lead.source} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
