"use client";
import React from 'react';
import { Header } from '@/components/Header';
import { PromptCard, PromptData } from '@/components/PromptCard';
import { Button } from '@/components/Button';
import { CreatePromptModal } from '@/components/CreatePromptModal';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfileClientProps {
  user: {
    username: string;
    full_name?: string;
    avatar_url?: string;
    xp: number;
    level: number;
    bio?: string;
    badge: string;
  };
  userPrompts: PromptData[];
  isCurrentUser: boolean;
}

export function UserProfileClient({ user, userPrompts, isCurrentUser }: UserProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tweakData, setTweakData] = useState<{ title: string; content: string; tags: string[]; parent_id?: string } | undefined>(undefined);

  const handleCreatePrompt = async (data: { title: string; content: string; tags: string[]; isAnonymous: boolean; parent_id?: string }) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const authorId = !data.isAnonymous && authUser ? authUser.id : null;

    const { data: newPromptData, error } = await supabase
      .from("prompts")
      .insert({
        title: data.title,
        content: data.content,
        tags: data.tags,
        author_id: authorId,
        parent_id: data.parent_id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating prompt:", error.message);
      return;
    }

    router.push(`/prompt/${newPromptData.id}`);
  };

  const handleTweak = (prompt: PromptData) => {
    setTweakData({
      title: prompt.title,
      content: prompt.content,
      tags: prompt.tags,
      parent_id: prompt.id
    });
    setIsModalOpen(true);
  };

  const handleOpenShare = () => {
    setTweakData(undefined);
    setIsModalOpen(true);
  };
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onShareClick={handleOpenShare} />
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
                <span className="text-sm font-semibold text-foreground/70">Lvl {user.level}</span>
                <span className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">{user.xp.toLocaleString()} XP</span>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed max-w-2xl">{user.bio || "No bio provided."}</p>
            
            {!isCurrentUser && (
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
              <PromptCard key={prompt.id} prompt={prompt} onTweak={handleTweak} />
            ))
          ) : (
            <div className="text-center py-12 bg-foreground/5 border border-border border-dashed rounded-xl">
              <p className="text-foreground/50 font-medium">This user hasn't shared any prompts yet.</p>
            </div>
          )}
        </div>

      </main>

      <CreatePromptModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreatePrompt} 
        initialData={tweakData}
      />
    </div>
  );
}
