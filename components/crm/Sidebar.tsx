"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/crm", label: "Overview" },
  { href: "/crm/leads", label: "Leads" },
  { href: "/crm/enquiries", label: "Enquiries" },
  { href: "/crm/demos", label: "Demos" },
  { href: "/crm/pipeline", label: "Pipeline" },
  { href: "/crm/conversations", label: "Conversations" },
  { href: "/crm/settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/crm") return pathname === "/crm";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:w-64 lg:shrink-0">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-emerald-100 bg-white px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Vedant CRM
          </p>
          <p className="text-sm text-zinc-500">Coaching enquiries</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-800"
        >
          Menu
        </button>
      </header>

      <button
        type="button"
        className={`fixed inset-0 z-30 bg-black/20 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none hidden"
        }`}
        aria-label="Close sidebar"
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-emerald-100 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-emerald-100 px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
            VC
          </div>
          <h1 className="mt-3 text-lg font-semibold text-zinc-900">Vedant CRM</h1>
          <p className="text-sm text-zinc-500">WhatsApp coaching desk</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : "text-zinc-600 hover:bg-emerald-50/70 hover:text-emerald-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-emerald-100 px-5 py-4 text-xs text-zinc-500">
          Sample + chatbot leads in one inbox
        </div>
      </aside>
    </div>
  );
}
