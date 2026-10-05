export default function SettingsPage() {
  const checks = [
    ["WhatsApp verify token", Boolean(process.env.WHATSAPP_VERIFY_TOKEN)],
    ["WhatsApp access token", Boolean(process.env.WHATSAPP_ACCESS_TOKEN)],
    ["Phone number ID", Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID)],
    ["Owner phone", Boolean(process.env.OWNER_PHONE)],
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-900">Settings</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Environment checks for the WhatsApp webhook. Secrets are never shown.
      </p>

      <div className="mt-6 max-w-xl space-y-3 rounded-xl border border-emerald-100 bg-white p-5">
        {checks.map(([label, ok]) => (
          <div key={String(label)} className="flex items-center justify-between text-sm">
            <span className="text-zinc-700">{label}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
              }`}
            >
              {ok ? "Configured" : "Missing"}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-xl text-sm text-zinc-500">
        Lead storage is in-memory for now so the dashboard stays simple. Completed
        chatbot forms write into the same list as the hardcoded sample leads.
        Swap `lib/crm-store.ts` for a database before deploying to serverless.
      </p>
    </div>
  );
}
