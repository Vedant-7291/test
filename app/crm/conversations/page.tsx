"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format-date";
import type { ChatbotSession } from "@/lib/types";

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<ChatbotSession[]>([]);

  useEffect(() => {
    fetch("/api/crm/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900">Conversations</h2>
      <p className="mt-1 text-sm text-zinc-500">
        In-progress WhatsApp chatbot sessions. Completed chats become leads.
      </p>

      <div className="mt-6 space-y-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-zinc-500">No live sessions right now.</p>
        ) : (
          sessions.map((session) => (
            <article
              key={session.phone}
              className="rounded-xl border border-emerald-100 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-zinc-900">
                  {session.answers.name || "Unknown student"} · +{session.phone}
                </h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  {session.done ? "Completed" : `Step ${session.step + 1} / 10`}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Updated {formatDateTime(session.updatedAt)}
              </p>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                {Object.entries(session.answers).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs uppercase tracking-wide text-zinc-400">
                      {key}
                    </dt>
                    <dd className="text-sm text-zinc-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
