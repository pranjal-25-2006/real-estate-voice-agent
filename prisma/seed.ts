import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.conversationMessage.deleteMany();
  await prisma.callTransfer.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.property.deleteMany();
  await prisma.agentConfig.deleteMany();

  // Create Properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        name: "Prestige Lakeside Habitat",
        type: "apartment",
        priceMin: 8500000,
        priceMax: 14000000,
        location: "Whitefield, Bangalore",
        description: "Luxury lakeside apartments with world-class amenities, swimming pool, gym, and 24/7 security.",
        bedrooms: 3,
        bathrooms: 3,
        areaSqft: 1850,
        status: "available",
        reraId: "PRM/KA/RERA/1251/446/PR/180328/001766",
      },
    }),
    prisma.property.create({
      data: {
        name: "Godrej Woodscapes",
        type: "villa",
        priceMin: 25000000,
        priceMax: 45000000,
        location: "Budigere Cross, Bangalore",
        description: "Premium villas surrounded by lush greenery with private gardens and modern architecture.",
        bedrooms: 4,
        bathrooms: 4,
        areaSqft: 3200,
        status: "available",
        reraId: "PRM/KA/RERA/1251/446/PR/210225/003989",
      },
    }),
    prisma.property.create({
      data: {
        name: "Kolte Patil Life Republic",
        type: "apartment",
        priceMin: 6500000,
        priceMax: 11000000,
        location: "Hinjewadi, Pune",
        description: "Integrated township with IT park proximity, school, hospital, and retail within the complex.",
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1200,
        status: "available",
        reraId: "P52100019982",
      },
    }),
    prisma.property.create({
      data: {
        name: "DLF The Camellias",
        type: "villa",
        priceMin: 50000000,
        priceMax: 100000000,
        location: "Golf Course Road, Gurgaon",
        description: "Ultra-luxury residences with private pools, concierge services, and DLF Golf & Country Club access.",
        bedrooms: 5,
        bathrooms: 5,
        areaSqft: 5500,
        status: "available",
        reraId: "RC/REP/HARERA/GGM/2018/32",
      },
    }),
    prisma.property.create({
      data: {
        name: "Lodha Amara",
        type: "apartment",
        priceMin: 12000000,
        priceMax: 22000000,
        location: "Thane, Mumbai",
        description: "Premium township with 40+ amenities including cricket ground, amphitheater, and jogging tracks.",
        bedrooms: 3,
        bathrooms: 2,
        areaSqft: 1600,
        status: "under_construction",
        reraId: "P51700016419",
      },
    }),
  ]);

  // Create Leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        name: "Rahul Sharma",
        phone: "+91 98765 43210",
        email: "rahul.sharma@gmail.com",
        budget: 15000000,
        propertyType: "apartment",
        preferredLocation: "Whitefield, Bangalore",
        timeline: "1-3 months",
        qualificationScore: 85,
        status: "qualified",
        source: "phone_call",
        notes: "Looking for 3BHK near IT parks. Wife works at IBM Whitefield.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Priya Patel",
        phone: "+91 87654 32109",
        email: "priya.patel@yahoo.com",
        budget: 30000000,
        propertyType: "villa",
        preferredLocation: "Budigere Cross, Bangalore",
        timeline: "immediately",
        qualificationScore: 92,
        status: "booked",
        source: "website",
        notes: "NRI client, relocating from Dubai. Wants gated community with international school nearby.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Amit Deshmukh",
        phone: "+91 76543 21098",
        email: "amit.d@outlook.com",
        budget: 8000000,
        propertyType: "apartment",
        preferredLocation: "Hinjewadi, Pune",
        timeline: "3-6 months",
        qualificationScore: 65,
        status: "new",
        source: "phone_call",
        notes: "IT professional, first-time buyer. Exploring options.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Sneha Reddy",
        phone: "+91 65432 10987",
        email: "sneha.reddy@gmail.com",
        budget: 50000000,
        propertyType: "villa",
        preferredLocation: "Golf Course Road, Gurgaon",
        timeline: "immediately",
        qualificationScore: 95,
        status: "qualified",
        source: "referral",
        notes: "Business owner, referred by existing client Rajesh Mehta. Wants premium property.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Vikram Singh",
        phone: "+91 54321 09876",
        email: "vsingh@hotmail.com",
        budget: 10000000,
        propertyType: "apartment",
        preferredLocation: "Thane, Mumbai",
        timeline: "6+ months",
        qualificationScore: 35,
        status: "new",
        source: "website",
        notes: "Just started looking. Budget might increase after bonus in December.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Ananya Iyer",
        phone: "+91 43210 98765",
        email: "ananya.iyer@gmail.com",
        budget: 12000000,
        propertyType: "apartment",
        preferredLocation: "Whitefield, Bangalore",
        timeline: "1-3 months",
        qualificationScore: 78,
        status: "booked",
        source: "phone_call",
        notes: "Software architect at Google. Wants ready-to-move-in property.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Karthik Menon",
        phone: "+91 32109 87654",
        email: "karthik.m@protonmail.com",
        budget: 20000000,
        propertyType: "commercial",
        preferredLocation: "Koramangala, Bangalore",
        timeline: "1-3 months",
        qualificationScore: 70,
        status: "transferred",
        source: "referral",
        notes: "Looking for commercial office space for startup. Transferred to commercial team.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Meera Joshi",
        phone: "+91 21098 76543",
        email: "meera.joshi@gmail.com",
        budget: 5000000,
        propertyType: "plot",
        preferredLocation: "Devanahalli, Bangalore",
        timeline: "3-6 months",
        qualificationScore: 45,
        status: "new",
        source: "website",
        notes: "Interested in plots near airport. Long-term investment perspective.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Rohan Kapoor",
        phone: "+91 10987 65432",
        email: "rohan.kapoor@icloud.com",
        budget: 18000000,
        propertyType: "apartment",
        preferredLocation: "HSR Layout, Bangalore",
        timeline: "immediately",
        qualificationScore: 20,
        status: "closed_lost",
        source: "phone_call",
        notes: "Went with a different builder. Budget was a concern for HSR area.",
      },
    }),
    prisma.lead.create({
      data: {
        name: "Nisha Agarwal",
        phone: "+91 09876 54321",
        email: "nisha.a@gmail.com",
        budget: 35000000,
        propertyType: "villa",
        preferredLocation: "Sarjapur Road, Bangalore",
        timeline: "1-3 months",
        qualificationScore: 88,
        status: "qualified",
        source: "phone_call",
        notes: "Looking for 4BHK villa with garden. Has two dogs, needs pet-friendly community.",
      },
    }),
  ]);

  // Create Conversations with Messages
  const convData = [
    { leadIdx: 0, sentiment: "positive", summary: "Rahul called inquiring about 3BHK apartments in Whitefield. Discussed Prestige Lakeside Habitat. Very interested, wants to schedule a site visit this weekend.", duration: 342 },
    { leadIdx: 1, sentiment: "positive", summary: "Priya called from Dubai asking about villa options. Discussed Godrej Woodscapes in detail. She wants to visit during her India trip next month.", duration: 485 },
    { leadIdx: 2, sentiment: "neutral", summary: "Amit called asking about Hinjewadi properties. Explained Kolte Patil Life Republic. He needs time to decide and compare options.", duration: 256 },
    { leadIdx: 3, sentiment: "positive", summary: "Sneha was referred by Rajesh Mehta. Interested in DLF Camellias. Discussed pricing and amenities. Wants private viewing arranged.", duration: 520 },
    { leadIdx: 4, sentiment: "neutral", summary: "Vikram called asking about budget apartments in Thane. Showed interest in Lodha Amara but concerned about under-construction status.", duration: 198 },
    { leadIdx: 5, sentiment: "positive", summary: "Ananya called about Prestige Lakeside. Already familiar with the project from online research. Quick to decide, wants to book this week.", duration: 275 },
    { leadIdx: 6, sentiment: "neutral", summary: "Karthik was looking for commercial space. Explained we focus on residential. Offered to transfer to our commercial division.", duration: 180 },
    { leadIdx: 8, sentiment: "negative", summary: "Rohan called to inform he went with Sobha for HSR Layout. Price was the main factor. Thanked us for our time.", duration: 145 },
    { leadIdx: 9, sentiment: "positive", summary: "Nisha called asking about pet-friendly villas. Very enthusiastic about Sarjapur area. Discussed Godrej Woodscapes.", duration: 390 },
    { leadIdx: 0, sentiment: "positive", summary: "Follow-up call with Rahul. He visited Prestige site over weekend. Loved the lake view. Wants to proceed with booking.", duration: 220 },
    { leadIdx: 1, sentiment: "positive", summary: "Priya confirmed her India visit dates. Scheduled villa tour for Godrej Woodscapes on the 15th.", duration: 165 },
    { leadIdx: 3, sentiment: "positive", summary: "Sneha completed private viewing of DLF Camellias. Extremely impressed. Requesting negotiation on final price.", duration: 310 },
  ];

  for (const conv of convData) {
    const conversation = await prisma.conversation.create({
      data: {
        leadId: leads[conv.leadIdx].id,
        duration: conv.duration,
        sentiment: conv.sentiment,
        summary: conv.summary,
        transcript: "Full transcript available in messages.",
      },
    });

    // Create messages based on conversation context
    const msgs = getMessages(conv.leadIdx, leads[conv.leadIdx].name);
    for (const msg of msgs) {
      await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          role: msg.role,
          content: msg.content,
        },
      });
    }
  }

  // Create Bookings
  await Promise.all([
    prisma.booking.create({
      data: {
        leadId: leads[1].id,
        propertyName: "Godrej Woodscapes",
        propertyId: properties[1].id,
        date: "2026-07-15",
        time: "10:00",
        status: "confirmed",
        notes: "VIP viewing. Client visiting from Dubai. Arrange airport pickup.",
      },
    }),
    prisma.booking.create({
      data: {
        leadId: leads[5].id,
        propertyName: "Prestige Lakeside Habitat",
        propertyId: properties[0].id,
        date: "2026-07-05",
        time: "14:00",
        status: "scheduled",
        notes: "Client prefers afternoon slots. Google employee.",
      },
    }),
    prisma.booking.create({
      data: {
        leadId: leads[3].id,
        propertyName: "DLF The Camellias",
        propertyId: properties[3].id,
        date: "2026-06-28",
        time: "11:00",
        status: "completed",
        notes: "Private viewing completed. Client very impressed. Negotiation ongoing.",
      },
    }),
    prisma.booking.create({
      data: {
        leadId: leads[9].id,
        propertyName: "Godrej Woodscapes",
        propertyId: properties[1].id,
        date: "2026-07-10",
        time: "16:00",
        status: "scheduled",
        notes: "Client bringing pets to check pet-friendliness.",
      },
    }),
    prisma.booking.create({
      data: {
        leadId: leads[0].id,
        propertyName: "Prestige Lakeside Habitat",
        propertyId: properties[0].id,
        date: "2026-06-29",
        time: "09:30",
        status: "completed",
        notes: "Client loved the lake-view apartment. Proceeding with booking.",
      },
    }),
    prisma.booking.create({
      data: {
        leadId: leads[2].id,
        propertyName: "Kolte Patil Life Republic",
        propertyId: properties[2].id,
        date: "2026-07-20",
        time: "11:00",
        status: "scheduled",
        notes: "First-time buyer, needs detailed walkthrough of amenities.",
      },
    }),
  ]);

  // Create Call Transfers
  await Promise.all([
    prisma.callTransfer.create({
      data: {
        leadId: leads[6].id,
        transferTo: "Commercial Team - Suresh",
        transferPhone: "+91 99888 77666",
        reason: "Client looking for commercial office space",
        status: "connected",
        duration: 420,
      },
    }),
    prisma.callTransfer.create({
      data: {
        leadId: leads[3].id,
        transferTo: "Senior Agent - Deepika",
        transferPhone: "+91 88776 65544",
        reason: "High-value NRI client needs premium handling",
        status: "connected",
        duration: 600,
      },
    }),
    prisma.callTransfer.create({
      data: {
        leadId: leads[4].id,
        transferTo: "Mumbai Team - Arjun",
        transferPhone: "+91 77665 54433",
        reason: "Thane property inquiry, needs local agent",
        status: "pending",
      },
    }),
    prisma.callTransfer.create({
      data: {
        leadId: leads[7].id,
        transferTo: "Plot Specialist - Manoj",
        transferPhone: "+91 66554 43322",
        reason: "Client interested in plots near airport",
        status: "failed",
      },
    }),
  ]);

  // Create Agent Config
  await Promise.all([
    prisma.agentConfig.create({ data: { key: "company_name", value: "PropVista Realty", label: "Company Name", type: "text", category: "general" } }),
    prisma.agentConfig.create({ data: { key: "greeting_message", value: "Hello! Welcome to PropVista Realty. I'm your AI property assistant. I can help you find your dream home, schedule site visits, and answer questions about our properties. How can I help you today?", label: "Greeting Message", type: "textarea", category: "general" } }),
    prisma.agentConfig.create({ data: { key: "tts_voice", value: "rachel", label: "TTS Voice", type: "text", category: "voice" } }),
    prisma.agentConfig.create({ data: { key: "speech_speed", value: "1.0", label: "Speech Speed", type: "number", category: "voice" } }),
    prisma.agentConfig.create({ data: { key: "language", value: "en-IN", label: "Language", type: "text", category: "voice" } }),
    prisma.agentConfig.create({ data: { key: "twilio_phone", value: "", label: "Twilio Phone Number", type: "text", category: "twilio" } }),
    prisma.agentConfig.create({ data: { key: "twilio_webhook", value: "", label: "Webhook URL", type: "text", category: "twilio" } }),
    prisma.agentConfig.create({ data: { key: "twilio_account_sid", value: "", label: "Account SID", type: "text", category: "twilio" } }),
    prisma.agentConfig.create({ data: { key: "min_budget_score", value: "5000000", label: "Minimum Budget for Qualification (INR)", type: "number", category: "qualification" } }),
    prisma.agentConfig.create({ data: { key: "high_value_threshold", value: "25000000", label: "High-Value Lead Threshold (INR)", type: "number", category: "qualification" } }),
    prisma.agentConfig.create({ data: { key: "auto_qualify_score", value: "70", label: "Auto-Qualify Score Threshold", type: "number", category: "qualification" } }),
    prisma.agentConfig.create({
      data: {
        key: "system_prompt",
        value: `You are a professional real estate AI assistant for PropVista Realty. Your role is to:

1. GREET callers warmly and ask how you can help
2. QUALIFY leads by understanding their needs:
   - Budget range
   - Property type preference (apartment, villa, plot, commercial)
   - Preferred location
   - Timeline for purchase
   - Purpose (self-use, investment, rental)
3. RECOMMEND properties from our portfolio that match their criteria
4. SCHEDULE site visits for interested buyers
5. TRANSFER to human agents for:
   - High-value leads (budget > 2.5 Cr)
   - Complex negotiations
   - NRI clients needing special assistance
   - When caller requests to speak with a person

Guidelines:
- Be professional, warm, and knowledgeable about Indian real estate
- Use INR for all pricing (Cr for >1Cr, Lakh for <1Cr)
- Mention RERA registration for trust
- Never make false promises about property availability
- Always capture: name, phone, email, budget, location preference
- Score leads 0-100 based on budget, timeline, and engagement level

Available Properties:
- Prestige Lakeside Habitat: 3BHK apartments, Whitefield Bangalore, ₹85L-1.4Cr
- Godrej Woodscapes: 4BHK villas, Budigere Cross Bangalore, ₹2.5-4.5Cr
- Kolte Patil Life Republic: 2BHK apartments, Hinjewadi Pune, ₹65L-1.1Cr
- DLF The Camellias: 5BHK villas, Golf Course Road Gurgaon, ₹5-10Cr
- Lodha Amara: 3BHK apartments, Thane Mumbai, ₹1.2-2.2Cr (under construction)`,
        label: "System Prompt",
        type: "textarea",
        category: "general",
      },
    }),
  ]);

  console.log("✅ Seed data created successfully!");
}

function getMessages(leadIdx: number, name: string) {
  const conversations: Record<number, Array<{ role: string; content: string }>> = {
    0: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. I'm your AI property assistant. How can I help you today?" },
      { role: "user", content: `Hi, I'm ${name}. I'm looking for a 3BHK apartment in Whitefield, Bangalore. My budget is around 1 to 1.5 crore.` },
      { role: "agent", content: "Great choice, Rahul! Whitefield is one of the most sought-after locations in Bangalore. Based on your budget of ₹1-1.5 Cr, I'd recommend Prestige Lakeside Habitat. It offers luxury 3BHK lakeside apartments starting from ₹85 lakhs up to ₹1.4 Cr. They have world-class amenities including a swimming pool, gym, and 24/7 security. Would you like to know more?" },
      { role: "user", content: "That sounds good. What's the carpet area? And is it ready to move in?" },
      { role: "agent", content: "The 3BHK units have a carpet area of approximately 1,850 sq ft with 3 bathrooms. The project is ready to move in with possession available immediately. It's RERA registered (PRM/KA/RERA/1251/446/PR/180328/001766) for your peace of mind. Would you like to schedule a site visit this weekend?" },
      { role: "user", content: "Yes, I'd love to visit this Saturday if possible. Morning would be great." },
      { role: "agent", content: "Perfect! I'll schedule a site visit for you this Saturday morning. Can I get your email address so I can send you the property brochure and directions? Also, may I know your timeline for purchase?" },
    ],
    1: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. How can I assist you today?" },
      { role: "user", content: "Hi, I'm calling from Dubai. My name is Priya Patel. I'm relocating to Bangalore and looking for a premium villa in a gated community. Budget is around 3 to 4 crore." },
      { role: "agent", content: "Welcome, Priya! It's wonderful to hear you're relocating back to India. For your budget of ₹3-4 Cr, I have an excellent option - Godrej Woodscapes at Budigere Cross. It's a premium villa community with 4BHK villas ranging from ₹2.5-4.5 Cr, surrounded by lush greenery with private gardens. Would you like to hear more?" },
      { role: "user", content: "That sounds lovely. I have two kids - are there good international schools nearby?" },
      { role: "agent", content: "Absolutely! Budigere Cross has several reputable international schools within a 10-15 minute drive, including Indus International School and Stonehill International. The community itself has a children's play area and is designed to be family-friendly. The villas are 3,200 sq ft with 4 bedrooms and 4 bathrooms. Would you like to schedule a visit when you're in India?" },
      { role: "user", content: "Yes, I'll be in Bangalore next month from the 12th to the 20th. Can you arrange a viewing?" },
    ],
    2: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. How can I help you?" },
      { role: "user", content: "Hi, I'm Amit. I work in IT and I'm looking for a 2BHK apartment in Hinjewadi, Pune. Something near the IT park." },
      { role: "agent", content: "Hi Amit! Hinjewadi is a great choice for IT professionals. I'd recommend Kolte Patil Life Republic - it's an integrated township right next to the IT park with 2BHK apartments ranging from ₹65 lakhs to ₹1.1 Cr. It includes a school, hospital, and retail within the complex. The carpet area is 1,200 sq ft." },
      { role: "user", content: "What's the possession status? And is it RERA registered?" },
      { role: "agent", content: "The project is ready with possession available. Yes, it's RERA registered with ID P52100019982. Would you like to schedule a visit?" },
      { role: "user", content: "Let me think about it. I'm also looking at a couple of other projects. Can you send me the brochure?" },
    ],
    3: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. How may I assist you?" },
      { role: "user", content: "Hi, Rajesh Mehta referred me. I'm Sneha. I'm looking for an ultra-premium property in Gurgaon. Budget is not a constraint - around 5 crore." },
      { role: "agent", content: "Welcome, Sneha! Thank you for the referral from Rajesh. For ultra-luxury living in Gurgaon, I'd highly recommend DLF The Camellias on Golf Course Road. It's the pinnacle of luxury - 5BHK residences ranging from ₹5-10 Cr with private pools, concierge services, and access to the DLF Golf & Country Club. The units are 5,500 sq ft with 5 bedrooms and 5 bathrooms." },
      { role: "user", content: "That sounds exactly like what I'm looking for. Can I get a private viewing arranged?" },
      { role: "agent", content: "Absolutely! We arrange exclusive private viewings for our premium clients. I'll have our senior agent Deepika personally assist you. She specializes in ultra-luxury properties. Shall I transfer you to her now, or would you prefer to schedule a specific time?" },
      { role: "user", content: "You can transfer me now. Also, I'd like to see the property this week if possible." },
    ],
    4: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. How can I help?" },
      { role: "user", content: "Hey, I'm Vikram. Looking for something affordable in Thane, Mumbai. Maybe around 1 crore." },
      { role: "agent", content: "Hi Vikram! For Thane, I'd recommend Lodha Amara - a premium township with 3BHK apartments starting from ₹1.2 Cr up to ₹2.2 Cr. It has 40+ amenities including a cricket ground and amphitheater. However, I should mention it's currently under construction. Would that work for you?" },
      { role: "user", content: "Under construction? When will it be ready? And can you go below 1.2 Cr?" },
      { role: "agent", content: "The possession timeline is approximately 18-24 months. The starting price for 3BHK is ₹1.2 Cr, but there may be some negotiation possible depending on the unit and payment plan. Given your timeline of 6+ months, this could work well since you'd be getting a pre-launch benefit on pricing. Want me to arrange a site visit to see the sample flat?" },
    ],
    5: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. How can I assist you?" },
      { role: "user", content: "Hi, I'm Ananya. I'm a software architect at Google and I'm looking for a 3BHK in Whitefield. Already did my research - interested in Prestige Lakeside Habitat." },
      { role: "agent", content: "Hi Ananya! Great to hear you've done your research. Prestige Lakeside Habitat is an excellent choice - 3BHK lakeside apartments from ₹85L-1.4Cr with 1,850 sq ft. Since you're already familiar with the project, would you like to schedule a site visit directly?" },
      { role: "user", content: "Actually, I've already seen photos online and read the reviews. If the lake-view units are available, I'd like to proceed with booking directly. My budget is around ₹1.2 Cr." },
      { role: "agent", content: "That's wonderful, Ananya! We do have lake-view units available in your budget. To proceed with booking, I'll need to arrange a meeting with our sales team. They'll walk you through the payment plans, bank loan options, and documentation. Can I schedule this for you this week?" },
    ],
    6: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. How can I help?" },
      { role: "user", content: "Hi, I'm Karthik. I'm looking for commercial office space in Koramangala for my startup. Around 2000 sq ft." },
      { role: "agent", content: "Hi Karthik! I appreciate you reaching out. PropVista Realty primarily specializes in residential properties. However, we do have a dedicated commercial real estate team that handles office spaces. Would you like me to transfer you to them? Our commercial specialist Suresh would be happy to assist you with office spaces in Koramangala." },
      { role: "user", content: "Yes please, transfer me to the commercial team." },
    ],
    8: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. How can I help?" },
      { role: "user", content: "Hi, this is Rohan. I called last week about properties in HSR Layout. I wanted to let you know I've decided to go with Sobha Dream Acres instead." },
      { role: "agent", content: "Hi Rohan, thank you for letting us know. May I ask what influenced your decision? Your feedback helps us improve our service." },
      { role: "user", content: "Honestly, the pricing was the main factor. Sobha offered a better deal for a similar configuration. Your team was very professional though." },
      { role: "agent", content: "I appreciate your honest feedback, Rohan. Congratulations on your new home! If anything changes or if you need real estate assistance in the future, please don't hesitate to reach out. We wish you all the best!" },
    ],
    9: [
      { role: "agent", content: "Hello! Welcome to PropVista Realty. How can I help you today?" },
      { role: "user", content: "Hi! I'm Nisha. I'm looking for a 4BHK villa in Sarjapur Road area. I have two dogs so it needs to be pet-friendly." },
      { role: "agent", content: "Hi Nisha! That's wonderful - we love pet parents! For pet-friendly villas in the Sarjapur area, I'd highly recommend Godrej Woodscapes at Budigere Cross. It's a premium gated community with 4BHK villas (₹2.5-4.5 Cr) with private gardens that are perfect for pets. The community has open green spaces and walking paths. The villas are 3,200 sq ft with 4 bedrooms and 4 bathrooms." },
      { role: "user", content: "That sounds perfect! What's the garden size? And are there other pet owners in the community?" },
      { role: "agent", content: "Each villa comes with a private garden, typically 400-600 sq ft. The community is quite popular among pet owners - there are dedicated pet walking zones and the open spaces are very pet-friendly. Many residents have dogs. Would you like to schedule a visit? We can arrange for you to see the community and meet some residents." },
      { role: "user", content: "I'd love that! Can we visit this week? I want to bring my dogs to see how they react to the space." },
      { role: "agent", content: "Absolutely! We encourage that. How about this Thursday at 4 PM? It's a great time as the weather is pleasant and you can see the evening atmosphere of the community. I'll make a note that you'll be bringing your pets so our agent can show you the pet-friendly areas." },
    ],
  };

  return conversations[leadIdx] || [
    { role: "agent", content: "Hello! Welcome to PropVista Realty. How can I help you today?" },
    { role: "user", content: `Hi, I'm ${name}. I'm interested in learning about available properties.` },
    { role: "agent", content: "I'd be happy to help! Could you tell me your budget range and preferred location?" },
  ];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
