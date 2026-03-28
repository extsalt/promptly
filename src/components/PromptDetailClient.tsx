"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptCard, PromptData } from "@/components/PromptCard";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { CreatePromptModal } from "@/components/CreatePromptModal";
import { createClient } from "@/utils/supabase/client";

interface Comment {
  id: string;
  author: string;
  content: string;
  upvotes: number;
  created_at: string;
}

interface PromptDetailClientProps {
  initialPrompt: PromptData;
  initialComments: Comment[];
}

export function PromptDetailClient({ initialPrompt, initialComments }: PromptDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tweakData, setTweakData] = useState<{ title: string; content: string; tags: string[]; parent_id?: string } | undefined>(undefined);

  const handleCreatePrompt = async (data: { title: string; content: string; tags: string[]; isAnonymous: boolean; parent_id?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const authorId = !data.isAnonymous && user ? user.id : null;

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

    // After tweaking, we navigate to the new prompt detail page
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to post a comment.");
      return;
    }

    const { data: newCommentData, error } = await supabase
      .from("comments")
      .insert({
        prompt_id: initialPrompt.id,
        author_id: user.id,
        content: newComment
      })
      .select(`
        *,
        profiles (
          username
        )
      `)
      .single();

    if (error) {
      console.error("Error adding comment:", error.message);
      return;
    }

    const formattedComment: Comment = {
      id: newCommentData.id,
      author: newCommentData.profiles.username,
      content: newCommentData.content,
      upvotes: 0,
      created_at: newCommentData.created_at
    };

    setComments([formattedComment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onShareClick={handleOpenShare} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => router.push('/')}
            className="p-1.5 -ml-1.5 hover:bg-foreground/5 rounded-md transition-colors flex justify-center items-center text-foreground/70 hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="font-semibold text-lg tracking-tight text-foreground">Prompt Detail</span>
        </div>

        <PromptCard prompt={initialPrompt} onTweak={handleTweak} />
        
        <div className="bg-card rounded-lg p-5 border border-border shadow-sm flex flex-col gap-5">
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            Comments 
            <span className="bg-border/50 text-foreground text-xs px-2 py-0.5 rounded font-mono">{comments.length}</span>
          </h3>
          
          <form onSubmit={handleAddComment} className="flex flex-col gap-3">
            <textarea 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="What are your thoughts on this prompt? Did it work for you?"
              className="w-full bg-background border border-border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none min-h-[90px] text-sm"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm">Post Comment</Button>
            </div>
          </form>

          <div className="flex flex-col gap-3 mt-2">
            {comments.map(c => (
              <div key={c.id} className="p-4 rounded-md bg-foreground/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-foreground">@{c.author}</span>
                  </div>
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
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
