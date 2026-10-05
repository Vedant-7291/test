import { LeadTable } from "@/components/crm/LeadTable";

export default function EnquiriesPage() {
  return (
    <LeadTable
      title="Enquiries"
      subtitle="Chatbot form submissions from WhatsApp, including seeded chatbot examples."
      defaultSource="chatbot"
    />
  );
}
