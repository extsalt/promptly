"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { PromptCard } from '@/components/PromptCard';
import { Button } from '@/components/Button';

// Mocked DB for user profiles
const mockUsers: Record<string, any> = {
  frontend_ninja: { username: "frontend_ninja", lvl: 42, xp: 12450, badge: "💎 Elite", bio: "Senior Engineer. I reverse-engineer LLM alignment for perfect React components." },
  curious_george: { username: "curious_george", lvl: 35, xp: 9230, badge: "🥇 Expert", bio: "Curiosity didn't kill the cat; it prompted a better one." },
  current_user: { username: "current_user", lvl: 12, xp: 3450, badge: "🔥 Contributor", bio: "React developer exploring the power of LLMs. Need a robust prompt? You've come to the right place." }
};

const userPromptsMap: Record<string, any[]> = {
  frontend_ninja: [
    { id: "1", title: "Senior React Developer Persona", content: "Act as a Senior React Developer...", author: "frontend_ninja", upvotes: 342, comments: 28, tags: ["React", "Code Review"] },
    { id: "2", title: "Next.js App Router Setup", content: "Generate an optimal Next.js 14 layout...", author: "frontend_ninja", upvotes: 180, comments: 12, tags: ["Next.js", "Setup"] }
  ],
  current_user: [
    { id: "3", title: "My Custom Prompt", content: "This is a custom prompt created by me.", author: "current_user", upvotes: 10, comments: 2, tags: ["Personal", "Experiment"] }
  ]
};

export default function UserProfilePage() {
  const params = useParams();
  const username = (params?.username as string) || "current_user";
  
  const user = mockUsers[username] || { username, lvl: 1, xp: 0, badge: "🥉 Novice", bio: "No bio provided." };
  const userPrompts = userPromptsMap[username] || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        
        {/* Profile Header */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-8 mb-8 flex flex-col sm:flex-row gap-6 sm:items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-foreground text-background flex items-center justify-center font-bold text-5xl shadow-md shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 flex flex-col items-start gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">@{user.username}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-bold px-2 py-0.5 rounded border border-border/50 bg-foreground/5 text-foreground/80">
                  {user.badge}
                </span>
                <span className="text-sm font-semibold text-foreground/70">Lvl {user.level || user.lvl}</span>
                <span className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">{user.xp.toLocaleString()} XP</span>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed max-w-2xl">{user.bio}</p>
            
            {username !== "current_user" && (
              <div className="mt-2">
                <Button variant="primary" size="sm">Follow @{user.username}</Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-border/50 mb-6">
          <button className="text-sm font-semibold text-foreground border-b-2 border-primary pb-3 px-1">Prompts ({userPrompts.length})</button>
          <button className="text-sm font-medium text-foreground/50 hover:text-foreground transition-colors pb-3 px-1">Upvoted</button>
          <button className="text-sm font-medium text-foreground/50 hover:text-foreground transition-colors pb-3 px-1">Saved</button>
        </div>

        {/* Prompts Feed */}
        <div className="flex flex-col gap-6">
          {userPrompts.length > 0 ? (
            userPrompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))
          ) : (
            <div className="text-center py-12 bg-foreground/5 border border-border border-dashed rounded-xl">
              <p className="text-foreground/50 font-medium">This user hasn't shared any prompts yet.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
