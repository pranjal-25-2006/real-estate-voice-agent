import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // 7 days ago for call volume
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalLeads,
      qualifiedLeads,
      bookedVisits,
      leadsByStatusRaw,
      topLocationsRaw,
      avgQualificationRaw,
      recentConversations,
      upcomingBookings,
      callVolumeRaw,
    ] = await Promise.all([
      // Total leads
      prisma.lead.count(),

      // Qualified leads (status = qualified, booked, or transferred)
      prisma.lead.count({
        where: { status: { in: ["qualified", "booked", "transferred"] } },
      }),

      // Booked visits (bookings with status scheduled or confirmed)
      prisma.booking.count({
        where: { status: { in: ["scheduled", "confirmed"] } },
      }),

      // Leads grouped by status
      prisma.lead.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Top locations
      prisma.lead.groupBy({
        by: ["preferredLocation"],
        _count: { id: true },
        where: { preferredLocation: { not: null } },
        orderBy: { _count: { preferredLocation: "desc" } },
        take: 5,
      }),

      // Average qualification score
      prisma.lead.aggregate({
        _avg: { qualificationScore: true },
      }),

      // Recent conversations (last 5)
      prisma.conversation.findMany({
        take: 5,
        orderBy: { timestamp: "desc" },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      // Upcoming bookings (next 3 scheduled/confirmed from today onward)
      prisma.booking.findMany({
        take: 3,
        orderBy: [{ date: "asc" }, { time: "asc" }],
        where: {
          status: { in: ["scheduled", "confirmed"] },
          date: { gte: todayStr },
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
      }),

      // Call volume last 7 days
      prisma.conversation.findMany({
        where: {
          timestamp: { gte: sevenDaysAgo },
        },
        select: {
          timestamp: true,
        },
      }),
    ]);

    // Build call volume array for last 7 days
    const callVolume: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      callVolume.push({ date: dateStr, count: 0 });
    }

    const callVolumeMap = new Map<string, number>();
    for (const conv of callVolumeRaw) {
      const dateStr = conv.timestamp.toISOString().split("T")[0];
      callVolumeMap.set(dateStr, (callVolumeMap.get(dateStr) || 0) + 1);
    }
    for (const entry of callVolume) {
      entry.count = callVolumeMap.get(entry.date) || 0;
    }

    // Format leads by status
    const leadsByStatus = leadsByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // Format top locations
    const topLocations = topLocationsRaw.map((item) => ({
      location: item.preferredLocation!,
      count: item._count.id,
    }));

    // Conversion rate
    const conversionRate =
      totalLeads > 0 ? (bookedVisits / totalLeads) * 100 : 0;

    return NextResponse.json({
      totalLeads,
      qualifiedLeads,
      bookedVisits,
      conversionRate: Math.round(conversionRate * 100) / 100,
      callVolume,
      leadsByStatus,
      topLocations,
      avgQualificationScore:
        Math.round((avgQualificationRaw._avg.qualificationScore || 0) * 100) /
        100,
      recentConversations,
      upcomingBookings,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}