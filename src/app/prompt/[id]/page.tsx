"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PromptCard, PromptData } from "@/components/PromptCard";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";

// Dummy data matching the home page
const dummyPrompt: PromptData = {
  id: "1",
  title: "Senior React Developer Persona",
  content: "Act as a Senior React Developer with 10 years of experience. Review my code focusing on performance, clean code principles, and accessibility. Provide actionable feedback with code examples.",
  author: "frontend_ninja",
  upvotes: 342,
  comments: 28,
  tags: ["React", "Code Review", "Persona"]
};

export default function PromptDetail() {
  const router = useRouter();
  const params = useParams();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "code_newbie", content: "This prompt is amazing! I use it every day for my PR reviews.", upvotes: 45 },
    { id: 2, author: "architect_bob", content: "You might want to add 'and ensure no legacy patterns are used' to the end for better results.", upvotes: 12 },
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([{ id: Date.now(), author: "current_user", content: newComment, upvotes: 0 }, ...comments]);
    setNewComment("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
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

        <PromptCard prompt={{...dummyPrompt, id: (params?.id as string) || dummyPrompt.id}} />
        
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
                  <button className="text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors flex items-center gap-1 bg-background border border-border/50 px-2 py-1 rounded">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                     {c.upvotes}
                  </button>
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
