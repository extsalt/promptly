"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./Button";
import { createClient } from "@/utils/supabase/client";

export interface PromptData {
  id: string;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  comments: number;
  tags: string[];
}

interface PromptCardProps {
  prompt: PromptData;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [upvotes, setUpvotes] = useState(prompt.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUpvote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("upvotes")
        .select()
        .eq("user_id", user.id)
        .eq("prompt_id", prompt.id)
        .single();

      if (data) setHasUpvoted(true);
    };

    checkUpvote();
  }, [prompt.id, supabase]);

  const handleUpvote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to upvote.");
      return;
    }

    if (hasUpvoted) {
      const { error } = await supabase
        .from("upvotes")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", prompt.id);

      if (!error) {
        setUpvotes((prev) => prev - 1);
        setHasUpvoted(false);
      }
    } else {
      const { error } = await supabase
        .from("upvotes")
        .insert({
          user_id: user.id,
          prompt_id: prompt.id
        });

      if (!error) {
        setUpvotes((prev) => prev + 1);
        setHasUpvoted(true);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadge = (author: string) => {
    if (author === "frontend_ninja") return { label: "Elite", icon: "💎", color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800" };
    if (author === "curious_george") return { label: "Expert", icon: "🥇", color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800" };
    return { label: "Novice", icon: "🥉", color: "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700" };
  };

  const badge = getBadge(prompt.author);

  return (
    <div className="bg-card border border-border shadow-sm hover:shadow-md transition-all rounded-lg p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-foreground mb-0">{prompt.title}</h3>
          <div className="flex items-center gap-2">
            {prompt.author && prompt.author !== 'Anonymous' ? (
              <Link href={`/profile/${prompt.author}`} className="text-xs font-semibold text-foreground/60 hover:text-primary transition-colors hover:underline">
                by @{prompt.author}
              </Link>
            ) : (
              <span className="text-xs font-semibold text-foreground/60">by Anonymous</span>
            )}
            <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.color}`}>
              {badge.icon} {badge.label}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {prompt.tags.map(tag => (
             <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/80 border border-border/50">
               {tag}
             </span>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border/50 rounded-md p-3 relative group">
        <p className="text-foreground/90 font-mono text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
          {prompt.content}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mt-2 px-1">
        <div className="flex items-center flex-wrap gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 bg-primary text-white hover:bg-primary-hover transition-all rounded-md shadow-sm active:scale-95"
            title="Copy Prompt"
          >
            {copied ? (
               <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied</>
            ) : (
               <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy</>
            )}
          </button>
          <div className="w-px h-3 bg-border mx-1 hidden sm:block"></div>
          <span className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wide">Run:</span>
          <div className="flex gap-1.5 flex-wrap">
            <a href={`https://chatgpt.com/?q=${encodeURIComponent(prompt.content)}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium px-2 py-0.5 bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors rounded-md border border-border flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829a.0804.0804 0 0 1-.0426-.0615V2.7388a4.4992 4.4992 0 0 1 6.1408 1.6464 4.4708 4.4708 0 0 1 .5346 3.0137l-.142-.0852-4.783-2.7581a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685v-2.3323a.0804.0804 0 0 1 .0332-.0615L14.26 2.0498a4.4992 4.4992 0 0 1 6.1408 1.6464zM4.5668 5.7171a4.4755 4.4755 0 0 1 2.8764 1.0408l-.1419.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.071.071 0 0 1-.038-.052V10.211a4.504 4.504 0 0 1 4.4945-4.4944zm11.2332 2.1786l-2.02-1.1686a.0757.0757 0 0 1 0-.071V3.86a4.485 4.485 0 0 1-2.3655 1.9728V11.6a.7664.7664 0 0 0-.3879-.6765l-5.8144-3.3543L12.5973 8.3829zM12 14.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
              ChatGPT
            </a>
            <a href={`https://gemini.google.com/app?q=${encodeURIComponent(prompt.content)}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium px-2 py-0.5 bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors rounded-md border border-border flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
              Gemini
            </a>
            <a href={`https://claude.ai/new`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium px-2 py-0.5 bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors rounded-md border border-border flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Claude
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wide">Share:</span>
          <div className="flex gap-1.5">
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(prompt.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/prompt/${prompt.id}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-border" title="Share on X">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(prompt.title + ' - ' + (typeof window !== 'undefined' ? window.location.origin : '') + '/prompt/' + prompt.id)}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-border" title="Share on WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent((typeof window !== 'undefined' ? window.location.origin : '') + '/prompt/' + prompt.id)}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors border border-border" title="Share on Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/50">
        <div className="flex gap-5">
          <button 
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${hasUpvoted ? 'text-primary' : 'text-foreground/60 hover:text-primary'}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
             {upvotes}
          </button>
          <button className="flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-blue-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             {prompt.comments}
          </button>
        </div>
        <Link href={`/prompt/${prompt.id}`}>
          <Button variant="ghost" size="sm" className="h-8">
            Discuss
          </Button>
        </Link>
      </div>
    </div>
  );
}
