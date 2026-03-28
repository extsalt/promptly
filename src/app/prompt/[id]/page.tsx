import React from "react";
import { createClient } from "@/utils/supabase/server";
import { PromptDetailClient } from "@/components/PromptDetailClient";
import { PromptData } from "@/components/PromptCard";
import { notFound } from "next/navigation";

export default async function PromptDetail({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: promptData, error: promptError } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles!author_id (
        username
      ),
      upvotes ( count ),
      comments ( count )
    `)
    .eq("id", id)
    .single();

  if (promptError || !promptData) {
    notFound();
  }

  const { data: commentsData } = await supabase
    .from("comments")
    .select(`
      *,
      profiles!author_id (
        username
      )
    `)
    .eq("prompt_id", id)
    .order('created_at', { ascending: false });

  const formattedPrompt: PromptData = {
    id: promptData.id,
    title: promptData.title,
    content: promptData.content,
    author: promptData.profiles?.username || 'Anonymous',
    upvotes: promptData.upvotes[0]?.count || 0,
    comments: promptData.comments[0]?.count || 0,
    tags: promptData.tags || []
  };

  const formattedComments = (commentsData || []).map((c: any) => ({
    id: c.id,
    author: c.profiles?.username || 'unknown',
    content: c.content,
    upvotes: 0, // Mocked for now
    created_at: c.created_at
  }));

  return <PromptDetailClient initialPrompt={formattedPrompt} initialComments={formattedComments} />;
}
