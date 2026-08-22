'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Code2,
  FileText,
  RotateCcw,
  ArrowRight,
  Terminal,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { generateCopilotResponse, CopilotResponse } from '@/lib/aiCopilotEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  cards?: CopilotResponse['cards'];
  suggestedFollowups?: string[];
  timestamp: string;
}

export default function SecurityCopilotPage() {
  const { findings, workspaceScore, applications } = useAppState();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello Alex! I am your **SentinelX Security Copilot**.

I have ingested findings, AST decompiler outputs, and runtime Frida probes across **${applications.length} applications** in your workspace.

How can I assist you with mobile vulnerability triage, exploitability analysis, or developer remediation?`,
      timestamp: 'Just now',
      suggestedFollowups: [
        'Analyze Critical Findings in Acme Banking',
        'Create a prioritized remediation plan',
        'Explain CWE-926 in simple words',
        'Summarize this workspace\'s security posture'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResult = generateCopilotResponse(queryText, findings);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResult.message,
        cards: aiResult.cards,
        suggestedFollowups: aiResult.suggestedFollowups,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header */}
      <div className="p-4 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/30 to-brand-cyan/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Security Copilot</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                AI Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Analyze findings, explain risks, and generate developer remediation diffs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isAi
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40'
              }`}>
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-2xl space-y-3 ${
                isAi ? 'text-slate-200' : 'bg-brand-500/15 border border-brand-cyan/30 p-3.5 rounded-2xl text-white'
              }`}>
                {/* Markdown text */}
                <div className="text-xs sm:text-sm leading-relaxed space-y-2 prose prose-invert max-w-none">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>

                {/* Structured Cards (if any) */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    {msg.cards.map((card, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3.5 rounded-2xl bg-black/60 border border-slate-800 shadow-md space-y-2 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            {card.title}
                          </span>
                          {card.severity && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              {card.severity}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-rose-300">
                          <strong>Impact:</strong> {card.impact}
                        </p>

                        <p className="text-[11px] text-emerald-300">
                          <strong>Recommendation:</strong> {card.recommendedAction}
                        </p>

                        {card.codeSnippet && (
                          <pre className="p-2.5 rounded-xl bg-black/90 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                            <code>{card.codeSnippet}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.suggestedFollowups.map((prompt, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSendMessage(prompt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-[11px] font-mono text-purple-300 hover:text-white transition-all flex items-center gap-1"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="w-3 h-3 text-purple-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Analyzing AST and OWASP MASVS context...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Quick Prompt Pills */}
      <div className="p-3 rounded-3xl bg-[#0d121c] border border-slate-800/80 shadow-xl space-y-2.5 shrink-0">
        {/* Quick Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          {[
            'Analyze Critical Findings',
            'Create Remediation Plan',
            'Explain Security Score',
            'Explain CWE-926',
            'Which vulnerabilities are exploitable?'
          ].map((quick, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSendMessage(quick)}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {quick}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Copilot about any vulnerability, CWE, MASVS rule, or remediation diff..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-cyan font-sans"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
