import React from "react";
import { createClient } from "@/utils/supabase/server";
import { HomeClient } from "@/components/HomeClient";
import { PromptData } from "@/components/PromptCard";
import { DEFAULT_PROMPTS } from "@/utils/defaultPrompts";


export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || url === 'YOUR_SUPABASE_URL' || !key || key === 'YOUR_SUPABASE_ANON_KEY' || key === 'YOUR_SUPABASE_PUBLISHABLE_DEFAULT_KEY') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-card border border-border rounded-xl mx-4 mt-8">
        <h2 className="text-xl font-bold mb-2">Supabase Configuration Required</h2>
        <p className="text-foreground/60 max-w-md"> Please fill in your Supabase URL and Anon Key in `.env.local` to see live prompts and start contributing. </p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: promptsData, error } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles!author_id (
        username
      ),
      upvotes ( count ),
      comments ( count )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching prompts:", error.message);
  }

  const initialPrompts: PromptData[] = (promptsData || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    author: p.profiles?.username || 'Anonymous',
    upvotes: p.upvotes[0]?.count || 0,
    comments: p.comments[0]?.count || 0,
    tags: p.tags || []
  }));

  // Fallback to default prompts if DB is empty
  const displayPrompts = initialPrompts.length > 0 ? initialPrompts : DEFAULT_PROMPTS.map((p, i) => ({
    ...p,
    id: `default-${i}`,
    author: 'System',
    upvotes: 0,
    comments: 0
  }));

  return <HomeClient initialPrompts={displayPrompts} />;
}

