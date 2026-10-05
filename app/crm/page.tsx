"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Lead } from "@/lib/types";
import { SourceBadge, StatusBadge } from "@/components/crm/StatusBadge";

type Stats = {
  total: number;
  demos: number;
  byStatus: Record<string, number>;
  bySource: { chatbot: number; sample: number };
  recent: Lead[];
};

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/crm/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return <p className="text-sm text-zinc-500">Loading dashboard...</p>;
  }

  const cards = [
    { label: "Total leads", value: stats.total },
    { label: "WhatsApp chatbot", value: stats.bySource.chatbot },
    { label: "Sample records", value: stats.bySource.sample },
    { label: "Demo requests", value: stats.demos },
    { label: "New", value: stats.byStatus.new || 0 },
    { label: "Enrolled", value: stats.byStatus.enrolled || 0 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900">Overview</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Hardcoded sample leads and WhatsApp chatbot submissions in one place.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-100/40"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-700">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-emerald-100 bg-white">
        <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4">
          <h3 className="font-semibold text-zinc-900">Recent enquiries</h3>
          <Link href="/crm/leads" className="text-sm font-medium text-emerald-700">
            View all
          </Link>
        </div>
        <ul>
          {stats.recent.map((lead) => (
            <li
              key={lead.id}
              className="flex flex-col gap-2 border-t border-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/crm/leads/${lead.id}`}
                  className="font-medium text-zinc-900 hover:text-emerald-700"
                >
                  {lead.name}
                </Link>
                <p className="text-sm text-zinc-500">
                  {lead.grade} · {lead.goal}
                </p>
              </div>
              <div className="flex gap-2">
                <SourceBadge source={lead.source} />
                <StatusBadge status={lead.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
