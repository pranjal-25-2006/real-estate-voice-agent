import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bolna POSTs here on every call status change (scheduled -> queued ->
// in-progress -> completed), using the same shape as its "Get Execution"
// API. We only act once the call is actually done, and we upsert by
// execution id so the earlier in-progress pings don't create duplicates.
//
// Configure this URL in your Bolna agent's Analytics tab -> "Push all
// execution data to webhook".
//
// Payload fields vary a bit by Bolna account/version, so this reads
// defensively rather than assuming one exact shape.

interface BolnaWebhookPayload {
  id?: string; // execution id
  status?: string;
  telephony_data?: {
    from_number?: string;
    to_number?: string;
    duration?: number;
    recording_url?: string;
  };
  transcript?: string;
  summary?: string;
  extracted_data?: Record<string, unknown>;
  conversation_duration?: number;
  context_data?: Record<string, unknown>;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asNumber(v: unknown): number | undefined {
  return typeof v === "number" && !Number.isNaN(v) ? v : undefined;
}

export async function POST(request: NextRequest) {
  try {
    // Optional shared-secret check — set BOLNA_WEBHOOK_SECRET and add the
    // same value as a query param or header on the webhook URL in Bolna's
    // dashboard if you want to guard against spoofed requests.
    const expectedSecret = process.env.BOLNA_WEBHOOK_SECRET;
    if (expectedSecret) {
      const provided =
        request.headers.get("x-webhook-secret") ||
        request.nextUrl.searchParams.get("secret");
      if (provided !== expectedSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body: BolnaWebhookPayload = await request.json();

    const executionId = asString(body.id);
    const status = asString(body.status);

    // Only write to the DB once the call is actually finished — the
    // in-progress pings don't have a transcript/summary yet anyway.
    if (!executionId || (status && !["completed", "hangup", "ended"].includes(status))) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const fromNumber = asString(body.telephony_data?.from_number) || "unknown";
    const extracted = body.extracted_data || {};

    // 1. Find or create the lead by phone number.
    let lead = await prisma.lead.findFirst({ where: { phone: fromNumber } });
    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: asString(extracted.name) || "Unknown Caller",
          phone: fromNumber,
          email: asString(extracted.email),
          budget: asNumber(extracted.budget) || 0,
          propertyType: asString(extracted.property_type) || "apartment",
          preferredLocation: asString(extracted.location),
          timeline: asString(extracted.timeline) || "not specified",
          source: "phone_call",
          status: "new",
        },
      });
    } else {
      // Refresh any fields Bolna's agent managed to extract this call that
      // we didn't already have.
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          email: lead.email || asString(extracted.email),
          budget: lead.budget || asNumber(extracted.budget) || 0,
          preferredLocation: lead.preferredLocation || asString(extracted.location),
        },
      });
    }

    // 2. Upsert the conversation by Bolna's execution id (idempotent —
    // safe if Bolna retries the webhook).
    const conversation = await prisma.conversation.upsert({
      where: { externalCallId: executionId },
      create: {
        leadId: lead.id,
        externalCallId: executionId,
        transcript: asString(body.transcript),
        summary: asString(body.summary),
        duration: asNumber(body.telephony_data?.duration) || asNumber(body.conversation_duration) || 0,
        recordingUrl: asString(body.telephony_data?.recording_url),
        sentiment: "neutral",
      },
      update: {
        transcript: asString(body.transcript),
        summary: asString(body.summary),
        duration: asNumber(body.telephony_data?.duration) || asNumber(body.conversation_duration) || 0,
        recordingUrl: asString(body.telephony_data?.recording_url),
      },
    });

    return NextResponse.json({ received: true, leadId: lead.id, conversationId: conversation.id });
  } catch (error) {
    console.error("Bolna webhook error:", error);
    // Still return 200 — returning an error here would make Bolna retry
    // with the same broken payload indefinitely.
    return NextResponse.json({ received: true, error: "processing_failed" });
  }
}
