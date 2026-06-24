// ─────────────────────────────────────────────────────────────────────────────
// MOCK CHANNEL TICKETS
// WhatsApp + Website tickets injected alongside real Gmail tickets for demo
// Pre-populated aiDrafts so the demo works instantly without calling the AI API
// ─────────────────────────────────────────────────────────────────────────────

export const mockChannelTickets = [

  // ── WhatsApp — KB RELEVANT (AI should draft) ─────────────────────────────
  {
    id: "WA-001",
    customerName: "Zara Ahmed",
    initials: "ZA",
    subject: "I want to return my order",
    time: "11:32 AM",
    status: "new",
    hasDraft: true,
    avatarVariant: "teal",
    email: "zara.ahmed@gmail.com",
    category: "Returns",
    content: "Hi, I ordered a jacket last week and it doesn't fit properly. I'd like to return it. The item is unused and still has all tags on. Can you help me?",
    sentiment: "Neutral",
    channel: "whatsapp",
    createdAt: new Date().toISOString(),
  },
  {
    id: "WA-002",
    customerName: "Bilal Tariq",
    initials: "BT",
    subject: "Received damaged product",
    time: "10:15 AM",
    status: "new",
    hasDraft: true,
    avatarVariant: "blue",
    email: "bilal.t@outlook.com",
    category: "Defective Item",
    content: "My order arrived today and the item is cracked and looks damaged. I have photos. What are my options? I need this fixed urgently.",
    sentiment: "Frustrated",
    channel: "whatsapp",
    createdAt: new Date().toISOString(),
  },
  {
    id: "WA-003",
    customerName: "Maria Santos",
    initials: "MS",
    subject: "PayPal refund timeline",
    time: "09:48 AM",
    status: "new",
    hasDraft: true,
    avatarVariant: "purple",
    email: "maria.s@gmail.com",
    category: "Refund",
    content: "I returned an item 3 days ago and my refund was approved. How long does it take to show up in my PayPal account?",
    sentiment: "Neutral",
    channel: "whatsapp",
    createdAt: new Date().toISOString(),
  },

  // ── WhatsApp — OUT OF CONTEXT (AI should escalate) ───────────────────────
  {
    id: "WA-004",
    customerName: "Usman Farooq",
    initials: "UF",
    subject: "Do you ship to UAE?",
    time: "08:22 AM",
    status: "new",
    hasDraft: false,
    avatarVariant: "green",
    email: "usman.f@gmail.com",
    category: "Shipping",
    content: "Hi, I'm based in Dubai, UAE. Do you offer international shipping to my location? What are the delivery charges and timelines?",
    sentiment: "Neutral",
    channel: "whatsapp",
    createdAt: new Date().toISOString(),
  },
  {
    id: "WA-005",
    customerName: "Aisha Khan",
    initials: "AK",
    subject: "Need a discount code",
    time: "07:55 AM",
    status: "new",
    hasDraft: false,
    avatarVariant: "blue",
    email: "aisha.k@hotmail.com",
    category: "Promotions",
    content: "Hello! I'm a loyal customer and was wondering if you have any current promo codes or discounts I can use on my next purchase?",
    sentiment: "Positive",
    channel: "whatsapp",
    createdAt: new Date().toISOString(),
  },

  // ── Website — KB RELEVANT (AI should draft) ──────────────────────────────
  {
    id: "WEB-001",
    customerName: "James Okafor",
    initials: "JO",
    subject: "Wrong item delivered",
    time: "12:10 PM",
    status: "new",
    hasDraft: true,
    avatarVariant: "teal",
    email: "j.okafor@business.com",
    category: "Order Issue",
    content: "I ordered a blue polo shirt in size L but received a completely different red shirt in size S. This is clearly a fulfilment error. Please correct this.",
    sentiment: "Frustrated",
    channel: "website",
    createdAt: new Date().toISOString(),
  },
  {
    id: "WEB-002",
    customerName: "Priya Sharma",
    initials: "PS",
    subject: "Exchange for different size",
    time: "11:05 AM",
    status: "new",
    hasDraft: true,
    avatarVariant: "purple",
    email: "priya.s@gmail.com",
    category: "Exchange",
    content: "Hi, I bought a dress in size M but it runs small. I'd like to exchange it for a size L. The item was delivered 12 days ago and is still in original packaging.",
    sentiment: "Neutral",
    channel: "website",
    createdAt: new Date().toISOString(),
  },

  // ── Website — OUT OF CONTEXT (AI should escalate) ────────────────────────
  {
    id: "WEB-003",
    customerName: "David Park",
    initials: "DP",
    subject: "What are your store hours?",
    time: "10:30 AM",
    status: "new",
    hasDraft: false,
    avatarVariant: "green",
    email: "d.park@gmail.com",
    category: "General",
    content: "Hi, I'd like to know your store opening hours and whether you have a physical location I can visit. Also do you have a phone number I can call?",
    sentiment: "Neutral",
    channel: "website",
    createdAt: new Date().toISOString(),
  },
  {
    id: "WEB-004",
    customerName: "Sara Mitchell",
    initials: "SM",
    subject: "Account password not working",
    time: "09:20 AM",
    status: "new",
    hasDraft: false,
    avatarVariant: "blue",
    email: "sara.m@yahoo.com",
    category: "Tech Support",
    content: "I've been locked out of my account. I reset my password twice but it still says incorrect. Can someone help me regain access urgently?",
    sentiment: "Frustrated",
    channel: "website",
    createdAt: new Date().toISOString(),
  },

  // ── Facebook Messenger — KB RELEVANT (AI should draft) ──────────────────
  {
    id: "FB-001",
    customerName: "Ahmed Siddiqui",
    initials: "AS",
    subject: "Want to return unused item",
    time: "11:50 AM",
    status: "new",
    hasDraft: true,
    avatarVariant: "blue",
    email: "ahmed.s@gmail.com",
    category: "Returns",
    content: "Hi there, I purchased a pair of shoes two weeks ago but they don't fit right. They are completely unused, still in the box with all tags. Can I return them for a full refund?",
    sentiment: "Neutral",
    channel: "facebook",
    createdAt: new Date().toISOString(),
  },
  {
    id: "FB-002",
    customerName: "Lena Hoffmann",
    initials: "LH",
    subject: "Item arrived broken",
    time: "10:40 AM",
    status: "new",
    hasDraft: true,
    avatarVariant: "teal",
    email: "lena.h@web.de",
    category: "Defective Item",
    content: "I just received my order and the product is broken straight out of the box. The packaging also looks like it was damaged during shipping. I need a replacement urgently.",
    sentiment: "Frustrated",
    channel: "facebook",
    createdAt: new Date().toISOString(),
  },

  // ── Facebook Messenger — OUT OF CONTEXT (AI should escalate) ─────────────
  {
    id: "FB-003",
    customerName: "Carlos Rivera",
    initials: "CR",
    subject: "Do you have a loyalty program?",
    time: "09:30 AM",
    status: "new",
    hasDraft: false,
    avatarVariant: "purple",
    email: "carlos.r@gmail.com",
    category: "General",
    content: "Hi! I shop with you regularly and was wondering if you have a loyalty or rewards program I can sign up for? Would love to earn points on my purchases.",
    sentiment: "Positive",
    channel: "facebook",
    createdAt: new Date().toISOString(),
  },
  {
    id: "FB-004",
    customerName: "Nadia Kowalski",
    initials: "NK",
    subject: "Can I change delivery address?",
    time: "08:45 AM",
    status: "new",
    hasDraft: false,
    avatarVariant: "green",
    email: "nadia.k@gmail.com",
    category: "Shipping",
    content: "I placed an order yesterday but I need to change the delivery address. I've moved to a new apartment and the old address is wrong. Is it too late to update it?",
    sentiment: "Neutral",
    channel: "facebook",
    createdAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRE-POPULATED AI DRAFTS for mock tickets
// These load instantly — no API call needed for demo
// ─────────────────────────────────────────────────────────────────────────────

export const mockAiDrafts: Record<string, { status: "draft" | "escalated"; reason?: string; draft?: string }> = {

  // WA-001: Return request — KB covers 30-day returns ✓
  "WA-001": {
    status: "draft",
    draft: `Hi Zara, thanks for reaching out! 😊

Great news — your item is fully eligible for a return. Under our Return & Refund Policy, you can return unused items in original condition within 30 days of delivery.

Here's how to get started:
1. Log into your account and go to Order History
2. Select your order and click 'Return or Exchange'
3. Choose the item and select a reason from the dropdown
4. Print the prepaid return label and drop it off at any carrier location

You'll receive email confirmation within 24 hours of us receiving your return. Your refund will be processed within 5–7 business days to your original payment method.

Let me know if you need any help with the process!

CareAgent Support`,
  },

  // WA-002: Damaged product — KB covers defective items with no return required ✓
  "WA-002": {
    status: "draft",
    draft: `Hi Bilal, I'm really sorry your order arrived damaged — that's not the experience we want for you at all.

The good news: for damaged or defective items, you don't need to return the product. Please send over the photos you mentioned and we'll get this resolved immediately.

Here's what we can offer you:
• Full replacement shipped with priority delivery at no charge
• Full refund including your original shipping cost
• Store credit equal to 110% of the item value (10% bonus for the inconvenience)

Just reply with your order number and the photos, and let us know which option you'd prefer. We'll take care of the rest right away.

CareAgent Support`,
  },

  // WA-003: PayPal refund timeline — KB covers 3–5 business days ✓
  "WA-003": {
    status: "draft",
    draft: `Hi Maria, happy to help with that!

PayPal refunds are typically processed within 3–5 business days and will be returned directly to your PayPal balance.

Since your refund was approved 3 days ago, you should see it come through within the next 1–2 business days. If it hasn't appeared after 5 business days, please reply here with your order number and we'll look into it straight away.

CareAgent Support`,
  },

  // WA-004: Shipping to UAE — not in KB → escalate ✗
  "WA-004": {
    status: "escalated",
    reason: "International shipping destinations and charges are not covered in our knowledge base — requires human agent to confirm.",
  },

  // WA-005: Discount code — not in KB → escalate ✗
  "WA-005": {
    status: "escalated",
    reason: "Promotional codes and discounts are not part of our support documentation — escalating to the relevant team.",
  },

  // WEB-001: Wrong item — KB covers fulfilment error returns ✓
  "WEB-001": {
    status: "draft",
    draft: `Hi James, I sincerely apologise for the mix-up with your order — receiving the wrong item is completely unacceptable and we'll make this right immediately.

Since this was a fulfilment error on our end, you are fully covered under our policy:
• Full replacement of the correct item shipped at no charge
• Or a full refund including your original shipping cost

You won't need to pay for return shipping — we'll provide a prepaid label.

To get started, please log into your account, go to Order History, select your order and click 'Return or Exchange'. Choose "Wrong item received" as the reason.

Alternatively, reply here with your order number and I can arrange this directly for you.

CareAgent Support`,
  },

  // WEB-002: Exchange for different size — KB covers 30-day exchanges ✓
  "WEB-002": {
    status: "draft",
    draft: `Hi Priya, of course — we're happy to arrange an exchange for you! 😊

Since your order was delivered 12 days ago, you're well within our 30-day exchange window.

Here's how to proceed:
1. Log into your account and go to Order History
2. Select your order and click 'Return or Exchange'
3. Select 'Exchange' as the reason and specify Size L in the notes field
4. Use the prepaid return label to send back the size M

We'll ship your size L as soon as we receive the original item. If size L happens to be out of stock, we'll notify you and offer a full refund or an alternative.

Let me know if you need any help!

CareAgent Support`,
  },

  // WEB-003: Store hours — not in KB → escalate ✗
  "WEB-003": {
    status: "escalated",
    reason: "Physical store locations and opening hours are not available in our knowledge base — this requires a human agent to assist.",
  },

  // WEB-004: Password/account access — tech support, not in KB → escalate ✗
  "WEB-004": {
    status: "escalated",
    reason: "Account access and login issues require technical support — this is beyond our current knowledge base and needs escalation to the tech team.",
  },

  // FB-001: Return request — KB covers 30-day returns ✓
  "FB-001": {
    status: "draft",
    draft: `Hi Ahmed, thanks for getting in touch! 😊

Great news — your shoes are fully eligible for a return. Since they're unused, in original packaging with all tags on, and within 30 days of purchase, you're completely covered.

Here's how to get started:
1. Log into your account and go to Order History
2. Select your order and click 'Return or Exchange'
3. Choose the shoes and select a return reason
4. Print the prepaid return label and drop off at any carrier

Your refund will be processed within 5–7 business days to your original payment method.

CareAgent Support`,
  },

  // FB-002: Broken item — KB covers defective items ✓
  "FB-002": {
    status: "draft",
    draft: `Hi Lena, I'm so sorry your order arrived damaged — we'll fix this straight away.

For damaged items, you don't need to return the product. Here's what we can offer:
• Full replacement shipped with priority delivery at no charge
• Full refund including your original shipping cost
• Store credit equal to 110% of the item value (10% bonus for the inconvenience)

Please reply with a photo of the damage and your order number, and let us know which option you prefer.

CareAgent Support`,
  },

  // FB-003: Loyalty program — not in KB → escalate ✗
  "FB-003": {
    status: "escalated",
    reason: "Loyalty and rewards programs are not covered in our knowledge base — requires a human agent to confirm.",
  },

  // FB-004: Change delivery address — not in KB → escalate ✗
  "FB-004": {
    status: "escalated",
    reason: "Changing delivery addresses on placed orders is not covered in our documentation — needs escalation to the fulfilment team.",
  },
};

// ── Legacy mock stats (used by Analytics) ────────────────────────────────────
export const mockStats = {
  openTickets: 10,
  aiDraftsReady: 6,
  avgResponseTime: "3m 48s",
  csatScore: 4.7,
  volumeTrend: [
    { label: "Mon", value: 45 },
    { label: "Tue", value: 52 },
    { label: "Wed", value: 38 },
    { label: "Thu", value: 65 },
    { label: "Fri", value: 48 },
    { label: "Sat", value: 24 },
    { label: "Sun", value: 18 },
  ],
  categories: [
    { name: "Order Issues", value: 42, color: "bg-brand" },
    { name: "Billing",      value: 28, color: "bg-teal" },
    { name: "Tech Support", value: 22, color: "bg-purple" },
    { name: "General Info", value: 8,  color: "bg-warn" },
  ],
  channelReplyRates: [
    {
      channel: "WhatsApp",
      color: "#25D366",
      data: [
        { day: "Mon", mins: 2.1 }, { day: "Tue", mins: 1.8 },
        { day: "Wed", mins: 3.2 }, { day: "Thu", mins: 1.5 },
        { day: "Fri", mins: 2.4 }, { day: "Sat", mins: 4.1 },
        { day: "Sun", mins: 5.2 },
      ],
      avgMins: 2.3, totalTickets: 5, escalated: 1,
    },
    {
      channel: "Facebook",
      color: "#1877F2",
      data: [
        { day: "Mon", mins: 4.5 }, { day: "Tue", mins: 5.2 },
        { day: "Wed", mins: 3.8 }, { day: "Thu", mins: 6.1 },
        { day: "Fri", mins: 4.9 }, { day: "Sat", mins: 7.3 },
        { day: "Sun", mins: 8.0 },
      ],
      avgMins: 5.7, totalTickets: 3, escalated: 1,
    },
    {
      channel: "Website",
      color: "#14B8A6",
      data: [
        { day: "Mon", mins: 1.2 }, { day: "Tue", mins: 0.9 },
        { day: "Wed", mins: 1.5 }, { day: "Thu", mins: 1.1 },
        { day: "Fri", mins: 2.0 }, { day: "Sat", mins: 1.8 },
        { day: "Sun", mins: 3.1 },
      ],
      avgMins: 1.7, totalTickets: 4, escalated: 2,
    },
  ],
};

export const mockChannels = [
  { id: "gmail",     name: "Gmail",              description: "Official support inbox connection",   connected: false },
  { id: "whatsapp",  name: "WhatsApp Business",   description: "Customer chat integration",           connected: true  },
  { id: "facebook",  name: "Facebook Messenger",  description: "Messenger inbox integration",         connected: true  },
  { id: "livechat",  name: "Web Live Chat",        description: "In-app support widget",               connected: true  },
  { id: "instagram", name: "Instagram DMs",        description: "Direct message management",           connected: false },
];
