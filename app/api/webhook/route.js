import { NextResponse } from "next/server";

/* ============================================================
   COACHING ENQUIRY BOT  (WhatsApp Cloud API + Next.js)
   File: app/api/whatsapp/route.js

   ENV VARIABLES (.env.local)
   WHATSAPP_VERIFY_TOKEN     = any secret string you set in Meta dashboard
   WHATSAPP_TOKEN            = permanent access token (System User)
   WHATSAPP_PHONE_NUMBER_ID  = phone number ID from Meta dashboard
   OWNER_PHONE               = (optional) your number with country code, e.g. 919876543210
   ============================================================ */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const OWNER_PHONE = process.env.OWNER_PHONE;

const INSTITUTE = "Your Coaching Institute"; // <-- change this

/* ------------------------------------------------------------
   SESSION STORE
   In-memory Map = fine for local testing / a single server.
   On Vercel/serverless it can reset between requests, so for
   production swap these 3 functions for Redis / Supabase /
   MongoDB / Firebase.
------------------------------------------------------------ */
const sessions = globalThis.__sessions || (globalThis.__sessions = new Map());
const seenMessages = globalThis.__seen || (globalThis.__seen = new Set());

async function getSession(phone) {
  return sessions.get(phone) || null;
}
async function saveSession(phone, data) {
  sessions.set(phone, { ...data, updatedAt: Date.now() });
}
async function saveLead(phone, lead) {
  // TODO: store in your DB / Google Sheet / CRM here
  console.log("📥 NEW LEAD:", phone, JSON.stringify(lead, null, 2));
}

/* ------------------------------------------------------------
   THE QUESTION FLOW  (10 questions)
   type: "text" | "buttons" (max 3, title <= 20 chars)
         | "list" (max 10 rows, title <= 24 chars)
------------------------------------------------------------ */
const STEPS = [
  {
    key: "name",
    type: "text",
    q: "1/10 👤 What is your *name*?",
  },
  {
    key: "enquiryFor",
    type: "buttons",
    q: "2/10 Who is this enquiry for?",
    options: ["Myself", "My child"],
  },
  {
    key: "grade",
    type: "list",
    q: "3/10 🎓 Which *class / level* is the student in?",
    button: "Select class",
    options: [
      "Class 5-7",
      "Class 8",
      "Class 9",
      "Class 10",
      "Class 11",
      "Class 12",
      "Dropper / Repeater",
      "College / Other",
    ],
  },
  {
    key: "board",
    type: "buttons",
    q: "4/10 📘 Which *board* does the student follow?",
    options: ["CBSE", "State Board", "ICSE / Other"],
  },
  {
    key: "subjects",
    type: "text",
    q: "5/10 📚 Which *subjects* do you need coaching in?\n(e.g. Maths, Physics, Chemistry, English)",
  },
  {
    key: "goal",
    type: "list",
    q: "6/10 🎯 What is the main *goal*?",
    button: "Select goal",
    options: [
      "Board exam prep",
      "JEE preparation",
      "NEET preparation",
      "Olympiad / NTSE",
      "Improve school marks",
      "Concept building",
      "Other",
    ],
  },
  {
    key: "mode",
    type: "buttons",
    q: "7/10 🏫 Preferred *mode* of classes?",
    options: ["Offline (Centre)", "Online", "Either is fine"],
  },
  {
    key: "timing",
    type: "buttons",
    q: "8/10 ⏰ Preferred *batch timing*?",
    options: ["Morning", "Afternoon", "Evening"],
  },
  {
    key: "challenge",
    type: "text",
    q: "9/10 💭 Briefly, what is the biggest *challenge* right now?\n(e.g. weak in Maths, low confidence, no regular study) — or type *skip*",
  },
  {
    key: "demo",
    type: "buttons",
    q: "10/10 🎁 Would you like to book a *free demo class*?",
    options: ["Yes, book demo", "Call me first", "Maybe later"],
  },
];

/* ------------------------------------------------------------
   WHATSAPP SENDERS
------------------------------------------------------------ */
async function waSend(payload) {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
    }
  );
  if (!res.ok) {
    console.error("❌ WA SEND ERROR:", res.status, await res.text());
  }
}

const sendText = (to, body) =>
  waSend({ to, type: "text", text: { body, preview_url: false } });

const sendButtons = (to, body, options) =>
  waSend({
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: options.map((o, i) => ({
          type: "reply",
          reply: { id: `opt_${i}`, title: o.slice(0, 20) },
        })),
      },
    },
  });

const sendList = (to, body, buttonLabel, options) =>
  waSend({
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body },
      action: {
        button: buttonLabel.slice(0, 20),
        sections: [
          {
            title: "Options",
            rows: options.map((o, i) => ({
              id: `opt_${i}`,
              title: o.slice(0, 24),
            })),
          },
        ],
      },
    },
  });

async function askStep(to, step) {
  if (step.type === "buttons") return sendButtons(to, step.q, step.options);
  if (step.type === "list") return sendList(to, step.q, step.button, step.options);
  return sendText(to, step.q);
}

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------ */
function extractUserInput(msg) {
  if (msg.type === "text") return msg.text?.body?.trim() || "";
  if (msg.type === "interactive") {
    const i = msg.interactive;
    if (i.type === "button_reply") return i.button_reply.title;
    if (i.type === "list_reply") return i.list_reply.title;
  }
  return null; // image, audio, etc.
}

// For button/list steps: match what the user typed/clicked to a valid option
function matchOption(step, input) {
  const clean = input.toLowerCase();
  return (
    step.options.find((o) => o.toLowerCase() === clean) ||
    step.options.find((o) => o.slice(0, 24).toLowerCase() === clean) ||
    step.options.find((o) => o.slice(0, 20).toLowerCase() === clean) ||
    null
  );
}

function buildSummary(a) {
  return (
    `✅ *Enquiry Summary*\n\n` +
    `👤 Name: ${a.name}\n` +
    `📝 For: ${a.enquiryFor}\n` +
    `🎓 Class: ${a.grade}\n` +
    `📘 Board: ${a.board}\n` +
    `📚 Subjects: ${a.subjects}\n` +
    `🎯 Goal: ${a.goal}\n` +
    `🏫 Mode: ${a.mode}\n` +
    `⏰ Timing: ${a.timing}\n` +
    `💭 Challenge: ${a.challenge}\n` +
    `🎁 Demo: ${a.demo}`
  );
}

async function finishEnquiry(phone, answers) {
  await saveLead(phone, { phone, ...answers, createdAt: new Date().toISOString() });

  await sendText(phone, buildSummary(answers));
  await sendText(
    phone,
    `Thank you, ${answers.name}! 🙏\n\nOur counsellor from *${INSTITUTE}* will contact you on this number shortly with fee, batch and demo details.\n\nType *hi* anytime to start a new enquiry.`
  );

  // Notify owner (works if owner messaged the bot in last 24h; otherwise use a template message)
  if (OWNER_PHONE) {
    await sendText(
      OWNER_PHONE,
      `🔔 *New Coaching Lead*\n📞 +${phone}\n\n${buildSummary(answers)}`
    );
  }
}

/* ------------------------------------------------------------
   MAIN CONVERSATION HANDLER
------------------------------------------------------------ */
async function handleMessage(phone, msg) {
  const input = extractUserInput(msg);

  if (input === null) {
    return sendText(phone, "Sorry, I can only read text and button replies. Please reply with text 🙂");
  }

  const lower = input.toLowerCase();
  let session = await getSession(phone);

  const wantsRestart = ["hi", "hello", "hey", "start", "restart", "menu"].includes(lower);

  // New user, finished user, or restart keyword -> start fresh
  if (!session || session.done || wantsRestart) {
    await saveSession(phone, { step: 0, answers: {}, done: false });
    await sendText(
      phone,
      `👋 Welcome to *${INSTITUTE}*!\n\nI'll ask you 10 quick questions so our counsellor can guide you better. It takes about 2 minutes.`
    );
    return askStep(phone, STEPS[0]);
  }

  // Back command
  if (lower === "back" && session.step > 0) {
    session.step -= 1;
    await saveSession(phone, session);
    return askStep(phone, STEPS[session.step]);
  }

  const step = STEPS[session.step];
  let value = input;

  // Validate current answer
  if (step.type === "text") {
    if (value.length < 2) {
      return sendText(phone, "Please type a valid answer 🙂");
    }
    if (step.key === "challenge" && lower === "skip") value = "Not specified";
  } else {
    const matched = matchOption(step, input);
    if (!matched) {
      await sendText(phone, "Please choose one of the options below 👇");
      return askStep(phone, step);
    }
    value = matched;
  }

  // Save answer + move on
  session.answers[step.key] = value;
  session.step += 1;

  if (session.step >= STEPS.length) {
    session.done = true;
    await saveSession(phone, session);
    return finishEnquiry(phone, session.answers);
  }

  await saveSession(phone, session);
  return askStep(phone, STEPS[session.step]);
}

/* ------------------------------------------------------------
   WEBHOOK: GET (Meta verification)
------------------------------------------------------------ */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ META WEBHOOK VERIFIED");
    return new Response(challenge, { status: 200 });
  }

  console.log("❌ META VERIFICATION FAILED");
  return new Response("Forbidden", { status: 403 });
}

/* ------------------------------------------------------------
   WEBHOOK: POST (incoming messages)
   Always answer 200, otherwise Meta keeps retrying the message.
------------------------------------------------------------ */
export async function POST(request) {
  try {
    const body = await request.json();

    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];

    // Delivery/read status updates have no "messages" -> ignore
    if (!msg) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Ignore duplicate deliveries
    if (seenMessages.has(msg.id)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    seenMessages.add(msg.id);
    if (seenMessages.size > 1000) seenMessages.clear();

    const phone = msg.from;
    console.log(`📩 ${phone} [${msg.type}]`);

    await handleMessage(phone, msg);
  } catch (error) {
    console.error("❌ POST ERROR:", error);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
