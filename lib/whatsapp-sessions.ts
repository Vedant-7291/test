import type { ChatbotSession } from "./types";

type SessionRecord = Omit<ChatbotSession, "phone">;

const globalStore = globalThis as typeof globalThis & {
  __waSessions?: Map<string, SessionRecord>;
  __waSeen?: Set<string>;
};

export const sessions =
  globalStore.__waSessions || (globalStore.__waSessions = new Map());
export const seenMessages =
  globalStore.__waSeen || (globalStore.__waSeen = new Set());

function seedSessions() {
  if (sessions.size > 0) return;
  sessions.set("919812345678", {
    step: 4,
    answers: {
      name: "Arjun Mehta",
      enquiryFor: "Myself",
      grade: "Class 12",
      board: "CBSE",
    },
    done: false,
    updatedAt: Date.parse("2026-10-05T05:20:00.000Z"),
  });
  sessions.set("918767112233", {
    step: 8,
    answers: {
      name: "Sneha Iyer",
      enquiryFor: "My child",
      grade: "Class 10",
      board: "State Board",
      subjects: "Maths, Science",
      goal: "Board exam prep",
      mode: "Offline (Centre)",
    },
    done: false,
    updatedAt: Date.parse("2026-10-05T05:28:00.000Z"),
  });
}

seedSessions();

export async function getSession(phone: string) {
  return sessions.get(phone) || null;
}

export async function saveSession(phone: string, data: SessionRecord) {
  sessions.set(phone, { ...data, updatedAt: Date.now() });
}

export function listSessions(): ChatbotSession[] {
  return Array.from(sessions.entries()).map(([phone, data]) => ({
    phone,
    ...data,
  }));
}
