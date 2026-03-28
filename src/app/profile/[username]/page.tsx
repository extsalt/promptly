import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { UserProfileClient } from "@/components/UserProfileClient";
import { PromptData } from "@/components/PromptCard";
import { notFound } from "next/navigation";

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = await params;
  const supabase = await createClient();

  // Get current user to check if this is their profile
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Get profile data
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profileData) {
    notFound();
  }

  // Get prompts by this user
  const { data: promptsData } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles!author_id (
        username
      ),
      upvotes ( count ),
      comments ( count )
    `)
    .eq("author_id", profileData.id)
    .order('created_at', { ascending: false });

  const formattedPrompts: PromptData[] = (promptsData || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    author: p.profiles?.username || 'Anonymous',
    upvotes: p.upvotes[0]?.count || 0,
    comments: p.comments[0]?.count || 0,
    tags: p.tags || []
  }));

  const user = {
    username: profileData.username,
    full_name: profileData.full_name,
    avatar_url: profileData.avatar_url,
    xp: profileData.xp || 0,
    level: profileData.level || 1,
    bio: profileData.bio,
    badge: profileData.xp > 10000 ? "💎 Elite" : profileData.xp > 5000 ? "🥇 Expert" : "🥉 Novice"
  };

  const isCurrentUser = currentUser?.id === profileData.id;

  return (
    <UserProfileClient 
      user={user} 
      userPrompts={formattedPrompts} 
      isCurrentUser={isCurrentUser} 
      userId={profileData.id}
    />
  );
}
