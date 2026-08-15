// Groq (Llama 3) helper — the "brain" of the voice agent.

function getGroqKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to your .env.local (see DEPLOYMENT.md)."
    );
  }
  return key;
}

export interface AgentTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Get the agent's next reply. Keeps replies short on purpose — this is a
 * voice call, not a chat window, so long paragraphs sound bad read aloud
 * and add latency (both to generate and to speak).
 */
export async function getAgentReply(params: {
  systemPrompt: string;
  leadContext?: string;
  history?: AgentTurn[];
  userMessage: string;
}): Promise<string> {
  const key = getGroqKey();

  const systemContent = params.leadContext
    ? `${params.systemPrompt}\n\nLead context:\n${params.leadContext}\n\nKeep replies short (1-3 sentences) and conversational — this will be read aloud on a phone call.`
    : `${params.systemPrompt}\n\nKeep replies short (1-3 sentences) and conversational — this will be read aloud on a phone call.`;

  const messages = [
    { role: "system", content: systemContent },
    ...(params.history || []).map((t) => ({ role: t.role, content: t.content })),
    { role: "user", content: params.userMessage },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Groq deprecated llama3-8b-8192, then (June 2026) llama-3.1-8b-instant
      // too. openai/gpt-oss-20b is their current recommended fast/cheap
      // replacement — check https://console.groq.com/docs/models if this
      // ever 400s with a "model_decommissioned" error.
      model: "openai/gpt-oss-20b",
      messages,
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return (
    data.choices?.[0]?.message?.content?.trim() ||
    "Sorry, could you say that again?"
  );
}
