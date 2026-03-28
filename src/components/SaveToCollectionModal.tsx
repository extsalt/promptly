"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./Button";
import { createClient } from "@/utils/supabase/client";
import { FolderPlus, Folder, Check, Loader2, Plus } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description?: string;
}

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptId: string;
}

export function SaveToCollectionModal({ isOpen, onClose, promptId }: SaveToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memberships, setMemberships] = useState<string[]>([]); // collection IDs
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch user's collections
    const { data: cols, error: colsError } = await supabase
      .from("collections")
      .select("id, name, description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (colsError) {
      console.error("Error fetching collections:", colsError.message);
    } else {
      setCollections(cols || []);
    }

    // Fetch current memberships for this prompt
    if (cols && cols.length > 0) {
      const { data: mems, error: memsError } = await supabase
        .from("collection_prompts")
        .select("collection_id")
        .eq("prompt_id", promptId)
        .in("collection_id", cols.map((c: Collection) => c.id));

      if (memsError) {
        console.error("Error fetching memberships:", memsError.message);
      } else {
        setMemberships(mems?.map((m: { collection_id: string }) => m.collection_id) || []);
      }
    }

    setLoading(false);
  }, [promptId, supabase]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const handleToggleCollection = async (collectionId: string) => {
    const isMember = memberships.includes(collectionId);
    
    if (isMember) {
      // Remove
      const { error } = await supabase
        .from("collection_prompts")
        .delete()
        .eq("collection_id", collectionId)
        .eq("prompt_id", promptId);
      
      if (!error) {
        setMemberships(prev => prev.filter(id => id !== collectionId));
      }
    } else {
      // Add
      const { error } = await supabase
        .from("collection_prompts")
        .insert({
          collection_id: collectionId,
          prompt_id: promptId
        });
      
      if (!error) {
        setMemberships(prev => [...prev, collectionId]);
      }
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim() || isCreating) return;

    setIsCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("collections")
      .insert({
        name: newCollectionName.trim(),
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating collection:", error.message);
    } else if (data) {
      setCollections(prev => [data, ...prev]);
      setNewCollectionName("");
      // Automatically add prompt to new collection
      await handleToggleCollection(data.id);
    }
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border bg-foreground/5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-foreground">Save to Collection</h2>
            <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider mt-0.5">Organize your prompts</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-foreground/10 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          {/* New Collection Form */}
          <form onSubmit={handleCreateCollection} className="relative">
            <input 
              type="text"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              placeholder="Create new collection..."
              className="w-full pl-10 pr-12 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
              <FolderPlus size={18} />
            </div>
            <button 
              type="submit"
              disabled={!newCollectionName.trim() || isCreating}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-30 transition-all"
            >
              {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} strokeWidth={3} />}
            </button>
          </form>

          <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-foreground/30">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-border/50 rounded-lg bg-foreground/[0.02]">
                <Folder size={32} className="mx-auto text-foreground/10 mb-3" />
                <p className="text-sm font-semibold text-foreground/40">No collections yet.</p>
                <p className="text-[11px] text-foreground/30 mt-1">Create one above to get started!</p>
              </div>
            ) : (
              collections.map(col => {
                const isSelected = memberships.includes(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => handleToggleCollection(col.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all group ${
                      isSelected 
                        ? "bg-foreground/5 border-foreground/20" 
                        : "bg-transparent border-transparent hover:bg-foreground/[0.03] hover:border-border/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className={`p-2 rounded-md transition-colors ${isSelected ? "bg-foreground text-background" : "bg-foreground/5 text-foreground/40 group-hover:text-foreground/60"}`}>
                        <Folder size={16} fill={isSelected ? "currentColor" : "none"} strokeWidth={isSelected ? 1.5 : 2.5} />
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? "text-foreground" : "text-foreground/70"}`}>
                        {col.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="bg-foreground text-background rounded-full p-0.5 animate-in zoom-in-50 duration-200">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 bg-foreground/[0.02] border-t border-border/50 flex justify-center">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[11px] font-black uppercase tracking-widest h-8 px-6 opacity-50 hover:opacity-100">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
