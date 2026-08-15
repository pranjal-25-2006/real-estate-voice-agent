"use client";

import { useState } from "react";
import { Phone, Mic, Bot, Loader2, TestTube, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface TestResult {
  transcript: string;
  response: string;
  costEstimate: {
    stt: number;
    llm: number;
    tts: number;
    total: number;
  };
}

export default function VoiceTestPage() {
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("groq"); // groq | deepseek | openai
  const [cost, setCost] = useState<TestResult["costEstimate"] | null>(null);

  const testVoiceAgent = async () => {
    if (!transcript.trim()) {
      toast.error("Enter a message first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/voice/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, model }),
      });
      const data: TestResult = await res.json();
      setResponse(data.response);
      setCost(data.costEstimate);
      toast.success("Pipeline executed!");
    } catch {
      toast.error("Failed to process");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Phone size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">India-Optimized Voice Agent</h3>
            <p className="text-sm text-slate-500">
              Sarvam AI (STT/TTS) + {model === "groq" ? "Groq (Llama 3)" : model === "deepseek" ? "DeepSeek" : "OpenAI"}
            </p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="flex gap-2 mb-4">
          {["groq", "deepseek", "openai"].map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                model === m
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {m === "groq" ? "Groq (Free)" : m === "deepseek" ? "DeepSeek (₹0.05/K)" : "OpenAI (₹7/K)"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Caller Message</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Type what the caller would say in Hinglish...&#10;e.g., 'Hi, mujhe Whitefield mein 3BHK chahiye budget 1.5 cr hai'"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={testVoiceAgent}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <TestTube size={16} />}
            {loading ? "Processing..." : "Test India Voice Pipeline"}
          </button>
        </div>
      </div>

      {response && (
        <div className="glass-card p-6 space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Mic size={16} />
              </div>
              <span className="text-sm font-medium text-blue-400">Caller (Hinglish)</span>
            </div>
            <p className="text-white text-sm leading-relaxed pl-11">{transcript}</p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Bot size={16} />
              </div>
              <span className="text-sm font-medium text-emerald-400">AI Agent (English/Hindi)</span>
            </div>
            <p className="text-white text-sm leading-relaxed pl-11">{response}</p>
          </div>

          {cost && (
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee size={14} className="text-emerald-400" />
                <span className="text-xs text-slate-400">Cost per call (estimated)</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <CostCard label="STT (Sarvam)" amount={cost.stt} />
                <CostCard label="LLM" amount={cost.llm} />
                <CostCard label="TTS (Sarvam)" amount={cost.tts} />
                <CostCard label="Total" amount={cost.total} highlight />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                ~{Math.round(1 / cost.total)} calls per ₹1 at this rate
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CostCard({ label, amount, highlight }: { label: string; amount: number; highlight?: boolean }) {
  return (
    <div className={`p-2 rounded-lg ${highlight ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/5"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-emerald-400" : "text-white"}`}>
        ₹{amount.toFixed(3)}
      </p>
    </div>
  );
}
