import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BolnaApiError, BolnaConfigError, triggerOutboundCall } from "@/lib/bolna";

// Speed-to-lead: call a freshly created lead within seconds instead of
// waiting for a human to notice it. Only fires for leads that didn't come
// in FROM a phone call already (no point calling someone who just hung up).
// Controlled by AUTO_CALL_NEW_LEADS in .env.local (default: on). Failures
// here must never fail the lead-creation request itself — the lead is
// already safely saved either way, so this just logs and moves on.
async function autoCallNewLead(lead: {
  id: string;
  name: string;
  phone: string;
  propertyType: string;
  preferredLocation: string | null;
  budget: number;
  timeline: string;
  source: string;
}) {
  if (process.env.AUTO_CALL_NEW_LEADS === "false") return;
  if (lead.source === "phone_call") return; // they just called us; don't call them back instantly

  try {
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
    await prisma.conversation.upsert({
      where: { externalCallId: result.executionId },
      create: {
        leadId: lead.id,
        externalCallId: result.executionId,
        duration: 0,
        sentiment: "neutral",
        summary: "Auto speed-to-lead call placed — awaiting result from Bolna.",
      },
      update: {},
    });
  } catch (error) {
    if (error instanceof BolnaConfigError) {
      // Bolna isn't configured yet (no BOLNA_API_KEY/BOLNA_AGENT_ID) — this
      // is expected until the person sets it up, so don't spam error logs.
      console.warn("Skipping auto speed-to-lead call:", error.message);
      return;
    }
    if (error instanceof BolnaApiError) {
      console.error("Auto speed-to-lead call failed:", error.status, error.body);
      return;
    }
    console.error("Auto speed-to-lead call failed:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { preferredLocation: { contains: search } },
      ];
    }

    const orderBy: Record<string, string> = {};
    orderBy[sort] = order;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              conversations: true,
              bookings: true,
              callTransfers: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        budget: body.budget,
        budgetCurrency: body.budgetCurrency || "INR",
        propertyType: body.propertyType,
        preferredLocation: body.preferredLocation,
        timeline: body.timeline,
        qualificationScore: body.qualificationScore || 0,
        status: body.status || "new",
        source: body.source,
        notes: body.notes,
      },
    });

    // Fire the speed-to-lead call, but don't let a slow/failing Bolna call
    // hold up the response to whatever created this lead (form, webhook, etc).
    autoCallNewLead(lead);

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}