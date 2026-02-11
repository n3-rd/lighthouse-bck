export type SectorRow = { sector: string; lift: string; why: string };

export type FeaturePageConfig = {
  pageTitle: string;
  sectors: SectorRow[];
  description: string; // HTML string for description panel (use list items for marketing)
  formTitle: string;
};

const viewroomSectors: SectorRow[] = [
  { sector: 'Trades', lift: '10–16%', why: 'Visual walkthroughs + multi-camera demos drastically reduce uncertainty, boost quote acceptance, and shorten decision cycles' },
  { sector: 'Tourism', lift: '10–16%', why: 'Experience previews and sales-assisted virtual tours significantly improve booking confidence' },
  { sector: 'Services', lift: '6–10%', why: 'Improves clarity in consultations and onboarding; modest but meaningful lift for high-ticket services' },
  { sector: "OEM's", lift: '12-18%', why: 'Complex products benefit from guided demos, reducing friction in procurement and increasing close rates' },
];

const viewroomDescription = `ViewRoom is an interactive virtual sales room embedded directly into your website. With one click, visitors enter a branded space where the first person in becomes the host and can invite others instantly—no scheduling, no static pages.<br><br>
Inside, businesses can present videos, PDFs, photos, demos, and proposals as a true on-demand showroom. Guests can co-watch content, chat in real time, and walk through options together. An integrated AI assistant answers questions, explains details, and can escalate the session to a live representative when needed. Reps can also join from the ViewRoom mobile app using multiple cameras to show job sites, run product demos, or guide inspections live.`;

export const viewroomPage: FeaturePageConfig = {
  pageTitle: 'ViewRoom: The Virtual Showroom that Closes Deals',
  sectors: viewroomSectors,
  description: viewroomDescription,
  formTitle: 'Demo the View Room',
};

export const chatbotPage: FeaturePageConfig = {
  pageTitle: 'Chat Bot + Conversational AI : Available 24/7 365 days a year',
  sectors: [
    { sector: 'Trades', lift: '14–20%', why: 'Instant answers reduce missed inquiries, qualify leads automatically, and route customers to quotes or photo uploads with zero delay; critical for price-sensitive, fast-moving jobs.' },
    { sector: 'Tourism', lift: '8–14%', why: 'Handles itinerary questions, availability, booking guidance, & event details instantly—lowers abandonment & boosting booking confidence.' },
    { sector: 'Services', lift: '5-9%', why: 'Supports intake, triage, FAQs, onboarding questions, and appointment routing. Helps convert undecided visitors where trust and clarity matter most.' },
    { sector: "OEM's", lift: '9–15%', why: 'Clarifies specs, requirements, compatibility, lead times, and documentation, reducing friction early in the procurement cycle.' },
  ],
  description: `ClearSky's AI Chatbot is a website assistant built to answer questions instantly, resulting in fewer missed leads, and smoother operations. Your business gets a dedicated bot that learns from your approved content—services, pricing ranges, policies, availability, product details, FAQs, and documents—so answers stay accurate, consistent, and on-brand.<br><br>
The bot handles 24/7 lead capture, qualifies inquiries, and guides visitors to the right next step: book a meeting, request a quote, upload photos, or connect with a live rep. It can also support existing customers with job updates, warranties, troubleshooting, and order status—reducing call volume while improving satisfaction.`,
  formTitle: 'Demo the ChatBot',
};

export const aiAutomationPage: FeaturePageConfig = {
  pageTitle: 'AI Automation — Intelligent Workflows That Keep Every Lead Moving',
  sectors: [
    { sector: 'Trades', lift: '12%', why: 'Trades lose many leads due to stalled follow-up; automation closes the gap.' },
    { sector: 'Tourism', lift: '10%', why: 'Bookings increase when nudges + reminders keep travelers engaged.' },
    { sector: 'Services', lift: '6%', why: 'Long cycles benefit from consistent touchpoints + automated updates.' },
    { sector: "OEM's", lift: '8%', why: 'Improves client response rates and reduces drop-off during intake.' },
  ],
  description: `AI Automation is a structured workflow engine that ensures no task, follow-up, or customer action is ever missed. It monitors every conversation across SMS, email, web forms, and chat, identifying what needs to happen next—and executing it automatically.<br><br>
From confirmations and reminders to information gathering and task assignment, automation keeps your pipeline active and organized. It eliminates delays, enforces process consistency, and maintains forward momentum even when your team is busy or offline. Businesses get a repeatable system that reduces manual workload, and protects revenue that typically slips through operational gaps.`,
  formTitle: 'Demo AI Automation',
};

export const marketingPage: FeaturePageConfig = {
  pageTitle: 'Dominate Local Search with AI + Expert Execution',
  sectors: [
    { sector: 'Trades', lift: '18–26%', why: 'Strong search intent, high competition, and high review impact → visibility gains convert directly into jobs.' },
    { sector: 'Tourism', lift: '20-28%', why: 'Discovery is driven by Maps, content, and reviews; better SEO + engagement increases booking flow.' },
    { sector: 'Services', lift: '10-16%', why: 'Increases qualified early-stage inquiries through improved authority, search visibility, and content depth.' },
    { sector: "OEM's", lift: '8-12%', why: 'Trust-driven categories rely heavily on reviews, content, and search visibility; marketing strengthens credibility.' },
  ],
  description: `Marketing Module provides all the essential work needed to keep your business visible, relevant, and competitive across Google, Maps, AI search, and social channels.<br><br>
<strong>Every month, ClearSky complete visibility &amp; content cycle, including:</strong>
<ul class="mt-2 list-disc pl-5 space-y-1">
<li>Local SEO updates &amp; technical fixes</li>
<li>Google Business Profile optimization</li>
<li>Review management &amp; response</li>
<li>Structured FAQs for AI + local search</li>
<li>Blog &amp; content publishing</li>
<li>Social engagement &amp; updates</li>
<li>Performance monitoring &amp; visibility reporting</li>
</ul>`,
  formTitle: 'Demo Marketing',
};

export const communicationHubPage: FeaturePageConfig = {
  pageTitle: 'Communication Hub',
  sectors: viewroomSectors,
  description: `The Communication Hub centralizes every message—SMS, email, web forms, voicemail transcripts, and social inquiries—into a single, organized workspace. No bouncing between tabs, no missed messages, no lost opportunities.<br><br>
Every conversation is tracked, analyzed, and enriched in real time. The A2P features ensures reliable delivery and protects your phone numbers, while built-in compliance keeps communication safe and consistent. Teams can respond instantly, review message history, tag conversations, and hand off tasks with zero friction. The hub becomes the nerve center of your customer communication—fast, accurate, and always accessible.`,
  formTitle: 'Demo Communication Hub',
};

export const conversationalAiPage: FeaturePageConfig = {
  pageTitle: 'Conversational AI',
  sectors: viewroomSectors,
  description: viewroomDescription,
  formTitle: 'Demo Conversational AI',
};

export const parsingPage: FeaturePageConfig = {
  pageTitle: 'Parsing',
  sectors: viewroomSectors,
  description: viewroomDescription,
  formTitle: 'Demo Parsing',
};
