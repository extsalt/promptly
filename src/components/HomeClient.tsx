"use client";
import React, { useState } from "react";
import { PromptCard, PromptData } from "@/components/PromptCard";
import { CreatePromptModal } from "@/components/CreatePromptModal";
import { Header } from "@/components/Header";
import { createClient } from "@/utils/supabase/client";

interface HomeClientProps {
  initialPrompts: PromptData[];
}

export function HomeClient({ initialPrompts }: HomeClientProps) {
  const [prompts, setPrompts] = useState<PromptData[]>(initialPrompts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const handleCreatePrompt = async (data: { title: string; content: string; tags: string[]; isAnonymous: boolean }) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Only use user.id if logged in AND not choosing to be anonymous
    const authorId = !data.isAnonymous && user ? user.id : null;

    const { data: newPromptData, error } = await supabase
      .from("prompts")
      .insert({
        title: data.title,
        content: data.content,
        tags: data.tags,
        author_id: authorId
      })
      .select(`
        *,
        profiles!author_id (
          username
        )
      `)
      .single();

    if (error) {
      console.error("Error creating prompt:", error.message);
      return;
    }

    const formattedPrompt: PromptData = {
      id: newPromptData.id,
      title: newPromptData.title,
      content: newPromptData.content,
      author: newPromptData.profiles?.username || 'Anonymous',
      upvotes: 0,
      comments: 0,
      tags: newPromptData.tags
    };

    setPrompts([formattedPrompt, ...prompts]);
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
              ].map(user => (
                <li key={user.name} className={`flex items-center justify-between group p-2 rounded-md transition-colors hover:bg-foreground/5`}>
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
