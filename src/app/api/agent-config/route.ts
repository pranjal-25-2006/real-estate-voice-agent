import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const configs = await prisma.agentConfig.findMany({
      orderBy: { category: "asc" },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("GET /api/agent-config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array of {key, value}" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      body.map(
        (item: { key: string; value: string }) =>
          prisma.agentConfig.update({
            where: { key: item.key },
            data: { value: item.value },
          })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("PUT /api/agent-config error:", error);
    return NextResponse.json(
      { error: "Failed to update agent config" },
      { status: 500 }
    );
  }
}