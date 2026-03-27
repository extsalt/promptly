"use client";
import React, { useState } from "react";
import { PromptCard, PromptData } from "@/components/PromptCard";
import { CreatePromptModal } from "@/components/CreatePromptModal";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";

// Mock data matching formal requirements: PromptData[] = [
const initialPrompts: PromptData[] = [
  {
    id: "1",
    title: "Senior React Developer Persona",
    content: "Act as a Senior React Developer with 10 years of experience. Review my code focusing on performance, clean code principles, and accessibility. Provide actionable feedback with code examples.",
    author: "frontend_ninja",
    upvotes: 342,
    comments: 28,
    tags: ["React", "Code Review", "Persona"]
  },
  {
    id: "2",
    title: "Startup Idea Validator",
    content: "I want you to act as a harsh startup investor. I will give you my startup idea. You will ask me 5 extremely difficult questions about my business model, market size, and customer acquisition strategy.",
    author: "founder_bot",
    upvotes: 189,
    comments: 15,
    tags: ["Business", "Startup", "Roleplay"]
  },
  {
    id: "3",
    title: "Explain Like I'm Five (ELI5) Complex Tech",
    content: "Explain the following technical concept as if I am 5 years old. Use simple analogies, avoid jargon, and keep it under 3 paragraphs. Concept: Quantum Entanglement.",
    author: "curious_george",
    upvotes: 456,
    comments: 42,
    tags: ["Education", "ELI5", "Physics"]
  }
];

export default function Home() {
  const [prompts, setPrompts] = useState<PromptData[]>(initialPrompts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePrompt = (data: { title: string; content: string; tags: string[] }) => {
    const newPrompt: PromptData = {
      id: Date.now().toString(),
      title: data.title,
      content: data.content,
      author: "current_user",
      upvotes: 0,
      comments: 0,
      tags: data.tags
    };
    setPrompts([newPrompt, ...prompts]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onShareClick={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-2 tracking-tight text-foreground">Trending Prompts</h2>
            <p className="text-foreground/70 text-base font-normal">Discover the best prompts engineered for LLMs. Copy, tweak, and share.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {prompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </div>

        <aside className="hidden lg:flex flex-col gap-6">
          {/* Gamification Leaderboard */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-base mb-4 text-foreground flex items-center justify-between">
              <span>Leaderboard</span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">This Week</span>
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { name: "frontend_ninja", pts: "12.4k", icon: "💎", rank: 1 },
                { name: "curious_george", pts: "9.2k", icon: "🥇", rank: 2 },
                { name: "ai_whisperer", pts: "8.1k", icon: "🥈", rank: 3 },
                { name: "prompt_god", pts: "6.5k", icon: "🥉", rank: 4 },
                { name: "current_user", pts: "3.4k", icon: "🔥", rank: 12 },
              ].map(user => (
                <li key={user.name} className={`flex items-center justify-between group p-2 rounded-md transition-colors ${user.name === 'current_user' ? 'bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50' : 'hover:bg-foreground/5'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground/40 w-4">{user.rank}</span>
                    <span className="text-sm font-medium text-foreground">{user.icon} @{user.name}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-foreground/60">
                    {user.pts} <span className="text-[10px] uppercase">XP</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 sticky top-20 shadow-sm">
            <h3 className="font-semibold text-base mb-4 text-foreground">Top Categories</h3>
            <ul className="flex flex-col gap-2">
              {["# Coding", "# Creative Writing", "# Productivity", "# Roleplay", "# Education"].map(tag => (
                <li key={tag} className="flex items-center justify-between group cursor-pointer px-2 py-1.5 rounded hover:bg-foreground/5 transition-colors">
                  <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground">{tag}</span>
                  <span className="text-xs font-mono bg-border/50 px-2 py-0.5 rounded text-foreground/60">
                    {Math.floor(Math.random() * 800) + 100}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      <CreatePromptModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreatePrompt} 
      />
    </div>
  );
}
