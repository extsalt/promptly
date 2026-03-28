"use client";
import React from 'react';
import { Header } from '@/components/Header';
import { PromptCard, PromptData } from '@/components/PromptCard';
import { Button } from '@/components/Button';
import { CreatePromptModal } from '@/components/CreatePromptModal';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, ChevronLeft, Plus, Bookmark } from 'lucide-react';

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
  userId: string;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export function UserProfileClient({ user, userPrompts, isCurrentUser, userId }: UserProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tweakData, setTweakData] = useState<{ title: string; content: string; tags: string[]; parent_id?: string } | undefined>(undefined);
  
  const [activeTab, setActiveTab] = useState<'prompts' | 'upvoted' | 'saved'>('prompts');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionPrompts, setCollectionPrompts] = useState<PromptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [upvotedPrompts, setUpvotedPrompts] = useState<PromptData[]>([]);

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

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (!error) setCollections(data || []);
    setLoading(false);
  }, [supabase, userId]);

  const fetchPromptsForCollection = async (collection: Collection) => {
    setLoading(true);
    setSelectedCollection(collection);
    
    const { data, error } = await supabase
      .from("collection_prompts")
      .select(`
        prompts (
          id, title, content, tags, parent_id,
          profiles (username),
          upvotes:upvotes(count),
          comments:comments(count)
        )
      `)
      .eq("collection_id", collection.id);

    if (!error && data) {
      const formattedPrompts = data.map((item: any) => ({
        id: item.prompts.id,
        title: item.prompts.title,
        content: item.prompts.content,
        tags: item.prompts.tags,
        parent_id: item.prompts.parent_id,
        author: item.prompts.profiles?.username || 'Anonymous',
        upvotes: item.prompts.upvotes?.[0]?.count || 0,
        comments: item.prompts.comments?.[0]?.count || 0
      }));
      setCollectionPrompts(formattedPrompts);
    }
    setLoading(false);
  };

  const fetchUpvotedPrompts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("upvotes")
      .select(`
        prompts (
          id, title, content, tags, parent_id,
          profiles (username),
          upvotes:upvotes(count),
          comments:comments(count)
        )
      `)
      .eq("user_id", userId);

    if (!error && data) {
      const formattedPrompts = data.map((item: any) => ({
        id: item.prompts.id,
        title: item.prompts.title,
        content: item.prompts.content,
        tags: item.prompts.tags,
        parent_id: item.prompts.parent_id,
        author: item.prompts.profiles?.username || 'Anonymous',
        upvotes: item.prompts.upvotes?.[0]?.count || 0,
        comments: item.prompts.comments?.[0]?.count || 0
      }));
      setUpvotedPrompts(formattedPrompts);
    }
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchCollections();
    } else if (activeTab === 'upvoted') {
      fetchUpvotedPrompts();
    }
  }, [activeTab, fetchCollections, fetchUpvotedPrompts]);

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
          <button 
            onClick={() => { setActiveTab('prompts'); setSelectedCollection(null); }}
            className={`text-sm font-semibold pb-3 px-1 transition-all ${activeTab === 'prompts' ? 'text-foreground border-b-2 border-primary' : 'text-foreground/50 hover:text-foreground'}`}
          >
            Prompts ({userPrompts.length})
          </button>
          <button 
            onClick={() => { setActiveTab('upvoted'); setSelectedCollection(null); }}
            className={`text-sm font-semibold pb-3 px-1 transition-all ${activeTab === 'upvoted' ? 'text-foreground border-b-2 border-primary' : 'text-foreground/50 hover:text-foreground'}`}
          >
            Upvoted
          </button>
          <button 
            onClick={() => { setActiveTab('saved'); setSelectedCollection(null); }}
            className={`text-sm font-semibold pb-3 px-1 transition-all ${activeTab === 'saved' ? 'text-foreground border-b-2 border-primary' : 'text-foreground/50 hover:text-foreground'}`}
          >
            Saved
          </button>
        </div>

        {/* Back button for collection view */}
        {activeTab === 'saved' && selectedCollection && (
          <div className="mb-6 flex items-center justify-between">
            <button 
              onClick={() => setSelectedCollection(null)}
              className="flex items-center gap-2 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors group"
            >
              <div className="p-1.5 rounded-full bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                <ChevronLeft size={16} />
              </div>
              Back to Collections
            </button>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Folder size={20} className="text-blue-500" />
              {selectedCollection.name}
            </h2>
          </div>
        )}

        {/* Prompts Feed / Collections List */}
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-foreground/10 border-t-foreground/40 rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/30">Loading...</span>
            </div>
          ) : activeTab === 'prompts' ? (
            userPrompts.length > 0 ? (
              userPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} onTweak={handleTweak} />
              ))
            ) : (
              <div className="text-center py-12 bg-foreground/5 border border-border border-dashed rounded-xl">
                <p className="text-foreground/50 font-medium">This user hasn't shared any prompts yet.</p>
              </div>
            )
          ) : activeTab === 'upvoted' ? (
            upvotedPrompts.length > 0 ? (
              upvotedPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} onTweak={handleTweak} />
              ))
            ) : (
              <div className="text-center py-12 bg-foreground/5 border border-border border-dashed rounded-xl">
                <p className="text-foreground/50 font-medium">You haven't upvoted any prompts yet.</p>
              </div>
            )
          ) : activeTab === 'saved' && selectedCollection ? (
            collectionPrompts.length > 0 ? (
              collectionPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} onTweak={handleTweak} />
              ))
            ) : (
              <div className="text-center py-12 bg-foreground/5 border border-border border-dashed rounded-xl">
                <p className="text-foreground/50 font-medium">This collection is empty.</p>
              </div>
            )
          ) : activeTab === 'saved' ? (
            collections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collections.map(col => (
                  <button 
                    key={col.id}
                    onClick={() => fetchPromptsForCollection(col)}
                    className="flex flex-col items-start p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all text-left group glossy-top-light shadow-sm"
                  >
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                      <Folder size={24} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{col.name}</h3>
                    <p className="text-sm text-foreground/50 line-clamp-2">{col.description || 'Custom collection of prompts'}</p>
                    <div className="mt-4 text-xs font-bold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">View Prompts →</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-foreground/5 border border-border border-dashed rounded-xl flex flex-col items-center gap-4">
                <Folder size={48} className="text-foreground/10" />
                <div>
                  <p className="text-foreground/50 font-bold text-lg">No collections yet</p>
                  <p className="text-foreground/40 text-sm mt-1">Start saving prompts to organize your library!</p>
                </div>
              </div>
            )
          ) : null}
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
