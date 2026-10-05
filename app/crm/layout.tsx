import { Sidebar } from "@/components/crm/Sidebar";

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4fbf6] text-zinc-900 lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
