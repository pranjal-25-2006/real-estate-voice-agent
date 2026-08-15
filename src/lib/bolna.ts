// Bolna outbound-calling client. This is what actually places the
// "speed to lead" phone call the moment a new lead comes in, instead of
// only reacting to Bolna via the webhook after a call has already happened.
//
// Docs: https://docs.bolna.ai/making-outgoing-calls
// POST https://api.bolna.ai/call
//   { agent_id, recipient_phone_number, from_phone_number?, user_data? }
// -> { id: <execution_id>, status, ... }  (id is the same execution id the
//    webhook later reports against, so we can upsert the Conversation row).

const BOLNA_API_BASE = "https://api.bolna.ai";

export class BolnaConfigError extends Error {}
export class BolnaApiError extends Error {
  constructor(message: string, public status: number, public body: string) {
    super(message);
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new BolnaConfigError(
      `${name} is not set. Add it to .env.local — see DEPLOYMENT.md.`
    );
  }
  return value;
}

/**
 * Converts a loosely-formatted Indian phone number into E.164
 * (Bolna requires E.164, e.g. +919876543210). Best-effort: assumes India
 * (+91) if no country code is present. Returns null if it can't make sense
 * of the input at all.
 */
export function toE164India(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  const bare = digits.replace(/^0+/, "");
  if (bare.length === 10) return `+91${bare}`;
  if (bare.length === 12 && bare.startsWith("91")) return `+${bare}`;
  return null;
}

export interface TriggerCallParams {
  recipientPhone: string;
  /** Free-form context passed through to the Bolna agent as {{variables}} in its prompt. */
  userData?: Record<string, unknown>;
  /** Override the agent used for this call; defaults to BOLNA_AGENT_ID. */
  agentId?: string;
}

export interface TriggerCallResult {
  executionId: string;
  raw: unknown;
}

/**
 * Places an outbound call via Bolna. Throws BolnaConfigError if required
 * env vars are missing, or BolnaApiError if Bolna's API rejects the request
 * (bad phone format, agent not found, no phone number attached, etc).
 */
export async function triggerOutboundCall(
  params: TriggerCallParams
): Promise<TriggerCallResult> {
  const apiKey = requireEnv("BOLNA_API_KEY");
  const agentId = params.agentId || requireEnv("BOLNA_AGENT_ID");

  const phone = toE164India(params.recipientPhone);
  if (!phone) {
    throw new BolnaApiError(
      `Could not parse "${params.recipientPhone}" into E.164 format`,
      400,
      ""
    );
  }

  const body: Record<string, unknown> = {
    agent_id: agentId,
    recipient_phone_number: phone,
  };
  if (process.env.BOLNA_FROM_PHONE_NUMBER) {
    body.from_phone_number = process.env.BOLNA_FROM_PHONE_NUMBER;
  }
  if (params.userData) {
    body.user_data = params.userData;
  }

  const res = await fetch(`${BOLNA_API_BASE}/call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new BolnaApiError(`Bolna /call failed (${res.status})`, res.status, text);
  }

  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text);
  } catch {
    // Bolna is expected to return JSON; if it doesn't, surface the raw text.
  }

  const executionId =
    (typeof json.id === "string" && json.id) ||
    (typeof json.execution_id === "string" && json.execution_id) ||
    (typeof json.call_id === "string" && json.call_id) ||
    "";

  if (!executionId) {
    throw new BolnaApiError(
      "Bolna /call succeeded but returned no execution id",
      res.status,
      text
    );
  }

  return { executionId, raw: json };
}
