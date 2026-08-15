import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAgentReply } from "@/lib/groq";

// Text-only pipeline used by the "Voice Test" dashboard page — lets you
// sanity-check the LLM + prompt without needing a real phone call.
// For the real Twilio call flow (with actual STT/TTS), see
// /api/voice/twilio/transcribe.
export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set. Add it to .env.local — see DEPLOYMENT.md." },
        { status: 500 }
      );
    }

    // 1. Get or create a test lead
    let lead = await prisma.lead.findFirst({ where: { name: "Test Caller" } });
    if (!lead) {
      lead = await prisma.lead.create({
  data: {
    name: "Test Caller",
    phone: "+91 99999 99999",
    source: "phone_call",
    budget: 0,
    propertyType: "apartment",
    status: "new",
    timeline: "immediately",
  },
});
    }

    // 2. Get system prompt
    const systemConfig = await prisma.agentConfig.findUnique({
      where: { key: "system_prompt" },
    });

    // 3. Call Groq for a real response
    const response = await getAgentReply({
      systemPrompt: systemConfig?.value || "You are a real estate agent in India.",
      userMessage: transcript,
    });

    // 4. Save to DB
    const conversation = await prisma.conversation.create({
      data: {
        leadId: lead.id,
        duration: 0,
        sentiment: "positive",
        transcript,
        summary: response,
        messages: {
          create: [
            { role: "user", content: transcript },
            { role: "agent", content: response },
          ],
        },
      },
    });

    // 5. Return response + cost estimate
    return NextResponse.json({
      transcript,
      response,
      conversationId: conversation.id,
      costEstimate: {
        stt: 0.3, // Sarvam per minute (not used in this text-only test)
        llm: 0, // Groq free tier
        tts: 0.5, // Sarvam per minute
        total: 0.8, // approx per real call
      },
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
