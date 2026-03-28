"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./Button";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  onShareClick?: () => void;
}

export function Header({ onShareClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };
  
  // Mocked stats for now, in real app these would be fetched from 'profiles' table
  const userStats = { lvl: 1, xp: 0 };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center text-background font-bold shadow-sm">
            P
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground hidden sm:block">Promptly</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>Explore</Link>
          <Link href="/leaderboard" className={`text-sm font-medium transition-colors ${pathname === '/leaderboard' ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>Leaderboard</Link>
          
          {!loading && user ? (
            <>
              <div className="hidden lg:flex items-center gap-2 bg-foreground/5 border border-border px-3 py-1.5 rounded-md mx-1">
                <span className="text-xs font-bold text-foreground/70">Lvl {userStats.lvl}</span>
                <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="w-0/4 h-full bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">{userStats.xp.toLocaleString()} XP</span>
              </div>
              <Link href={`/profile/${user.user_metadata.username || user.email}`} className={`text-sm font-medium transition-colors ${pathname.startsWith('/profile') ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>Profile</Link>
              <button 
                onClick={handleSignOut}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Log Out
              </button>
            </>
          ) : !loading && (
            <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Log In</Link>
          )}

          {onShareClick && (
            <Button 
              onClick={onShareClick}
              variant="primary"
              className="font-bold px-4 py-2 h-9 rounded-md transition-all shadow-md active:scale-95 leading-none"
            >
              Share Prompt
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
