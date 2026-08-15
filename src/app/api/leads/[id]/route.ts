import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        conversations: {
          orderBy: { timestamp: "desc" },
          include: {
            messages: {
              orderBy: { timestamp: "asc" },
            },
          },
        },
        bookings: {
          orderBy: { createdAt: "desc" },
        },
        callTransfers: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("GET /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.budget !== undefined && { budget: body.budget }),
        ...(body.budgetCurrency !== undefined && { budgetCurrency: body.budgetCurrency }),
        ...(body.propertyType !== undefined && { propertyType: body.propertyType }),
        ...(body.preferredLocation !== undefined && { preferredLocation: body.preferredLocation }),
        ...(body.timeline !== undefined && { timeline: body.timeline }),
        ...(body.qualificationScore !== undefined && { qualificationScore: body.qualificationScore }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.source !== undefined && { source: body.source }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("PUT /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}