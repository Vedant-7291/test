"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types";
import { SourceBadge, StatusBadge } from "@/components/crm/StatusBadge";

const STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "demo-booked",
  "enrolled",
  "lost",
];

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/crm/leads/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.lead) {
          setLead(data.lead);
          setNotes(data.lead.notes || "");
        } else {
          setError(data.error || "Lead not found");
        }
      });
  }, [params.id]);

  async function save(patch: { status?: LeadStatus; notes?: string }) {
    if (!lead) return;
    setSaving(true);
    const res = await fetch(`/api/crm/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data.lead) setLead(data.lead);
    setSaving(false);
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }
  if (!lead) {
    return <p className="text-sm text-zinc-500">Loading lead...</p>;
  }

  const fields = [
    ["Phone", `+${lead.phone}`],
    ["Enquiry for", lead.enquiryFor],
    ["Class", lead.grade],
    ["Board", lead.board],
    ["Subjects", lead.subjects],
    ["Goal", lead.goal],
    ["Mode", lead.mode],
    ["Timing", lead.timing],
    ["Challenge", lead.challenge],
    ["Demo", lead.demo],
  ];

  return (
    <div>
      <Link href="/crm/leads" className="text-sm font-medium text-emerald-700">
        ← Back to leads
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">{lead.name}</h2>
          <p className="mt-1 text-sm text-zinc-500">Created {lead.createdAt.slice(0, 10)}</p>
        </div>
        <div className="flex gap-2">
          <SourceBadge source={lead.source} />
          <StatusBadge status={lead.status} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-zinc-900">Enquiry answers</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-zinc-400">
                  {label}
                </dt>
                <dd className="mt-1 text-sm text-zinc-800">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-100 bg-white p-5">
            <label className="text-sm font-medium text-zinc-800">Status</label>
            <select
              value={lead.status}
              onChange={(e) => save({ status: e.target.value as LeadStatus })}
              className="mt-2 w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-5">
            <label className="text-sm font-medium text-zinc-800">Counsellor notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="mt-2 w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => save({ notes })}
              className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
