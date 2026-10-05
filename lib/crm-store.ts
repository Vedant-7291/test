import type { Lead, LeadSource, LeadStatus } from "./types";

type GlobalCrm = typeof globalThis & {
  __crmLeads?: Map<string, Lead>;
};

const store = globalThis as GlobalCrm;
const leads = store.__crmLeads || (store.__crmLeads = new Map());

const STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "demo-booked",
  "enrolled",
  "lost",
];

function id() {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function seedLeads() {
  if (leads.size > 0) return;

  const samples: Array<Omit<Lead, "updatedAt">> = [
    {
      id: "lead_sample_priya",
      phone: "919900112233",
      name: "Priya Sharma",
      enquiryFor: "My child",
      grade: "Class 10",
      board: "CBSE",
      subjects: "Maths, Science",
      goal: "Board exam prep",
      mode: "Offline (Centre)",
      timing: "Evening",
      challenge: "Weak in Maths, low confidence",
      demo: "Yes, book demo",
      status: "demo-booked",
      source: "sample",
      notes: "Counsellor assigned. Demo on Saturday 5pm.",
      createdAt: "2026-09-18T09:20:00.000Z",
    },
    {
      id: "lead_sample_rahul",
      phone: "918888776655",
      name: "Rahul Verma",
      enquiryFor: "Myself",
      grade: "Dropper / Repeater",
      board: "CBSE",
      subjects: "Physics, Chemistry, Maths",
      goal: "JEE preparation",
      mode: "Online",
      timing: "Morning",
      challenge: "No regular study routine",
      demo: "Call me first",
      status: "contacted",
      source: "sample",
      notes: "Called once. Wants weekend batch.",
      createdAt: "2026-09-22T11:05:00.000Z",
    },
    {
      id: "lead_sample_ananya",
      phone: "917712223344",
      name: "Ananya Gupta",
      enquiryFor: "My child",
      grade: "Class 8",
      board: "ICSE / Other",
      subjects: "English, Maths",
      goal: "Improve school marks",
      mode: "Either is fine",
      timing: "Afternoon",
      challenge: "Not specified",
      demo: "Maybe later",
      status: "new",
      source: "sample",
      notes: "",
      createdAt: "2026-09-28T16:40:00.000Z",
    },
    {
      id: "lead_sample_vikram",
      phone: "919134567890",
      name: "Vikram Singh",
      enquiryFor: "Myself",
      grade: "Class 12",
      board: "State Board",
      subjects: "Biology, Chemistry",
      goal: "NEET preparation",
      mode: "Offline (Centre)",
      timing: "Evening",
      challenge: "Needs concept building in Organic Chemistry",
      demo: "Yes, book demo",
      status: "enrolled",
      source: "sample",
      notes: "Joined evening NEET batch. First fee paid.",
      createdAt: "2026-08-30T08:10:00.000Z",
    },
    {
      id: "lead_sample_meera",
      phone: "916600998877",
      name: "Meera Nair",
      enquiryFor: "My child",
      grade: "Class 5-7",
      board: "CBSE",
      subjects: "Maths, English",
      goal: "Olympiad / NTSE",
      mode: "Online",
      timing: "Morning",
      challenge: "School does not cover olympiad syllabus",
      demo: "Call me first",
      status: "lost",
      source: "sample",
      notes: "Joined another institute closer to home.",
      createdAt: "2026-09-05T13:15:00.000Z",
    },
    {
      id: "lead_chatbot_kabir",
      phone: "919876543210",
      name: "Kabir Joshi",
      enquiryFor: "Myself",
      grade: "Class 11",
      board: "CBSE",
      subjects: "Physics, Maths",
      goal: "JEE preparation",
      mode: "Offline (Centre)",
      timing: "Evening",
      challenge: "Weak in Physics numericals",
      demo: "Yes, book demo",
      status: "new",
      source: "chatbot",
      notes: "",
      createdAt: "2026-10-02T18:22:00.000Z",
    },
    {
      id: "lead_chatbot_ishita",
      phone: "918765432109",
      name: "Ishita Rao",
      enquiryFor: "My child",
      grade: "Class 9",
      board: "State Board",
      subjects: "Maths, Science, English",
      goal: "Concept building",
      mode: "Either is fine",
      timing: "Afternoon",
      challenge: "Low confidence",
      demo: "Call me first",
      status: "contacted",
      source: "chatbot",
      notes: "Parent prefers weekday afternoon.",
      createdAt: "2026-10-04T07:48:00.000Z",
    },
  ];

  for (const sample of samples) {
    const lead: Lead = {
      ...sample,
      updatedAt: sample.createdAt,
    };
    leads.set(lead.id, lead);
  }
}

seedLeads();

function statusFromDemo(demo: string): LeadStatus {
  if (demo.toLowerCase().includes("demo")) return "demo-booked";
  return "new";
}

export function listLeads(filters?: {
  status?: string;
  source?: string;
  q?: string;
}) {
  let rows = Array.from(leads.values());
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((l) => l.status === filters.status);
  }
  if (filters?.source && filters.source !== "all") {
    rows = rows.filter((l) => l.source === filters.source);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter((l) =>
      [l.name, l.phone, l.subjects, l.goal, l.grade, l.board]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  return rows.sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

export function getLead(leadId: string) {
  return leads.get(leadId) || null;
}

export function addLeadFromChatbot(input: {
  phone: string;
  name?: string;
  enquiryFor?: string;
  grade?: string;
  board?: string;
  subjects?: string;
  goal?: string;
  mode?: string;
  timing?: string;
  challenge?: string;
  demo?: string;
  createdAt?: string;
}) {
  const now = input.createdAt || new Date().toISOString();
  const demo = input.demo || "Not specified";
  const lead: Lead = {
    id: id(),
    phone: input.phone,
    name: input.name || "Unknown",
    enquiryFor: input.enquiryFor || "",
    grade: input.grade || "",
    board: input.board || "",
    subjects: input.subjects || "",
    goal: input.goal || "",
    mode: input.mode || "",
    timing: input.timing || "",
    challenge: input.challenge || "",
    demo,
    status: statusFromDemo(demo),
    source: "chatbot",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  leads.set(lead.id, lead);
  return lead;
}

export function createLead(input: Partial<Lead> & { phone: string; name: string }) {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: id(),
    phone: input.phone,
    name: input.name,
    enquiryFor: input.enquiryFor || "",
    grade: input.grade || "",
    board: input.board || "",
    subjects: input.subjects || "",
    goal: input.goal || "",
    mode: input.mode || "",
    timing: input.timing || "",
    challenge: input.challenge || "",
    demo: input.demo || "",
    status: input.status && STATUSES.includes(input.status) ? input.status : "new",
    source: (input.source as LeadSource) || "sample",
    notes: input.notes || "",
    createdAt: now,
    updatedAt: now,
  };
  leads.set(lead.id, lead);
  return lead;
}

export function updateLead(
  leadId: string,
  patch: Partial<Pick<Lead, "status" | "notes">>
) {
  const current = leads.get(leadId);
  if (!current) return null;
  if (patch.status && !STATUSES.includes(patch.status)) return current;
  const next: Lead = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  leads.set(leadId, next);
  return next;
}

export function getStats() {
  const rows = listLeads();
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<
    LeadStatus,
    number
  >;
  const bySource = { chatbot: 0, sample: 0 };
  for (const lead of rows) {
    byStatus[lead.status] += 1;
    bySource[lead.source] += 1;
  }
  return {
    total: rows.length,
    byStatus,
    bySource,
    demos: rows.filter((l) => l.demo.toLowerCase().includes("demo")).length,
    recent: rows.slice(0, 5),
  };
}
