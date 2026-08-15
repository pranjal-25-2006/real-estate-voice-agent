import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const leadId = searchParams.get("leadId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    const [transfers, total] = await Promise.all([
      prisma.callTransfer.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      }),
      prisma.callTransfer.count({ where }),
    ]);

    return NextResponse.json({
      transfers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/call-transfers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch call transfers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const transfer = await prisma.callTransfer.create({
      data: {
        leadId: body.leadId,
        conversationId: body.conversationId,
        transferTo: body.transferTo,
        transferPhone: body.transferPhone,
        reason: body.reason,
        status: body.status || "pending",
        duration: body.duration,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error("POST /api/call-transfers error:", error);
    return NextResponse.json(
      { error: "Failed to create call transfer" },
      { status: 500 }
    );
  }
}