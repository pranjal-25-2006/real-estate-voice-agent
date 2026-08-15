import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.AUTH_USERNAME;
    const expectedHash = process.env.AUTH_PASSWORD_HASH;

    if (!expectedUsername || !expectedHash) {
      return NextResponse.json(
        {
          error:
            "Auth isn't configured yet. Set AUTH_USERNAME, AUTH_PASSWORD_HASH, and AUTH_SESSION_SECRET in .env.local — see DEPLOYMENT.md.",
        },
        { status: 500 }
      );
    }

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username !== expectedUsername ||
      !(await verifyPassword(password, expectedHash))
    ) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await createSessionToken(username);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
