import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Cal.com POSTs here on BOOKING_CREATED / BOOKING_RESCHEDULED / BOOKING_CANCELLED.
// Set this URL under Cal.com -> Settings -> Developer -> Webhooks, and set the
// same secret there and in CALCOM_WEBHOOK_SECRET below.
//
// This is the source of truth for the Bookings table — Bolna's built-in
// "Book Appointment" tool talks to Cal.com directly during the call, so this
// webhook (not Bolna) is what actually populates your dashboard's Bookings page.

interface CalcomAttendee {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

interface CalcomWebhookPayload {
  triggerEvent: "BOOKING_CREATED" | "BOOKING_RESCHEDULED" | "BOOKING_CANCELLED" | string;
  createdAt: string;
  payload: {
    uid?: string;
    bookingId?: number;
    title?: string;
    startTime?: string;
    attendees?: CalcomAttendee[];
    status?: string;
  };
}

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
  } catch {
    // Length mismatch etc. -> definitely not a match
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (secret) {
    const signature = request.headers.get("x-cal-signature-256");
    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: CalcomWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { triggerEvent, payload } = body;
    const bookingUid = payload.uid;
    if (!bookingUid) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const attendee = payload.attendees?.[0];
    const attendeePhone = attendee?.phoneNumber;

    if (triggerEvent === "BOOKING_CANCELLED") {
      await prisma.booking.updateMany({
        where: { externalBookingId: bookingUid },
        data: { status: "cancelled" },
      });
      return NextResponse.json({ received: true });
    }

    // BOOKING_CREATED or BOOKING_RESCHEDULED
    const start = payload.startTime ? new Date(payload.startTime) : new Date();
    const date = start.toISOString().split("T")[0];
    const time = start.toISOString().split("T")[1]?.slice(0, 5) || "00:00";

    // Match the lead by phone if Cal.com captured it, otherwise by email.
    let lead = attendeePhone
      ? await prisma.lead.findFirst({ where: { phone: attendeePhone } })
      : null;
    if (!lead && attendee?.email) {
      lead = await prisma.lead.findFirst({
        where: { email: attendee.email },
      });
    }
    if (!lead) {
      // Booking came in without a matching lead (e.g. booked outside a
      // Bolna call) — create a minimal lead so the booking still has
      // somewhere to live.
      lead = await prisma.lead.create({
        data: {
          name: attendee?.name || "Unknown",
          phone: attendeePhone || "unknown",
          email: attendee?.email,
          budget: 0,
          propertyType: "apartment",
          timeline: "not specified",
          source: "website",
          status: "booked",
        },
      });
    }

    await prisma.booking.upsert({
      where: { externalBookingId: bookingUid },
      create: {
        leadId: lead.id,
        externalBookingId: bookingUid,
        propertyName: payload.title || "Site Visit",
        date,
        time,
        status: "scheduled",
      },
      update: {
        date,
        time,
        status: "scheduled",
      },
    });

    // Reflect the booking on the lead's funnel stage.
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "booked" },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Cal.com webhook error:", error);
    return NextResponse.json({ received: true, error: "processing_failed" });
  }
}
