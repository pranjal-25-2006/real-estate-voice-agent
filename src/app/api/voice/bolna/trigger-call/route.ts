import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BolnaApiError, BolnaConfigError, triggerOutboundCall } from "@/lib/bolna";

// POST { leadId } -> places an outbound Bolna call to that lead right now.
// Used both by the dashboard's "Call Now" button and by the auto speed-to-lead
// hook in POST /api/leads. Protected by middleware.ts (requires a logged-in
// session) — this initiates real phone calls, so it must not be public.
export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();
    if (!leadId || typeof leadId !== "string") {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const result = await triggerOutboundCall({
      recipientPhone: lead.phone,
      userData: {
        lead_id: lead.id,
        name: lead.name,
        property_type: lead.propertyType,
        preferred_location: lead.preferredLocation || "",
        budget: lead.budget,
        timeline: lead.timeline,
      },
    });

    // Reserve the Conversation row now (status-wise this is "call placed,
    // not yet finished") so the dashboard shows something immediately.
    // The Bolna webhook will upsert this same row (matched by
    // externalCallId) with the transcript/summary/duration once the call
    // actually completes.
    await prisma.conversation.upsert({
      where: { externalCallId: result.executionId },
      create: {
        leadId: lead.id,
        externalCallId: result.executionId,
        duration: 0,
        sentiment: "neutral",
        summary: "Outbound call placed — awaiting result from Bolna.",
      },
      update: {},
    });

    return NextResponse.json({
      success: true,
      executionId: result.executionId,
      leadId: lead.id,
    });
  } catch (error) {
    if (error instanceof BolnaConfigError) {
      console.error("Bolna config error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof BolnaApiError) {
      console.error("Bolna API error:", error.status, error.body);
      return NextResponse.json(
        { error: `Bolna rejected the call request: ${error.body || error.message}` },
        { status: 502 }
      );
    }
    console.error("trigger-call error:", error);
    return NextResponse.json({ error: "Failed to place call" }, { status: 500 });
  }
}
