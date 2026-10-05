import type { LeadSource, LeadStatus } from "./types";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  "demo-booked": "Demo booked",
  enrolled: "Enrolled",
  lost: "Lost",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  chatbot: "WhatsApp chatbot",
  sample: "Sample data",
};
