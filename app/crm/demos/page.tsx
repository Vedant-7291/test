import { LeadTable } from "@/components/crm/LeadTable";

export default function DemosPage() {
  return (
    <LeadTable
      title="Demos"
      subtitle="People who asked to book a free demo class."
      demoOnly
    />
  );
}
