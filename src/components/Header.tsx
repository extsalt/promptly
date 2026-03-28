"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./Button";
import { createClient } from "@/utils/supabase/client";
import { Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-sm glossy-top-light">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all active:scale-95">
          <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center text-background font-black shadow-lg shadow-primary/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            P
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground hidden sm:block">Promptly</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-bold tracking-tight transition-colors ${pathname === '/' ? 'text-foreground' : 'text-foreground/40 hover:text-foreground'}`}>Explore</Link>
          <Link href="/leaderboard" className={`text-sm font-bold tracking-tight transition-colors ${pathname === '/leaderboard' ? 'text-foreground' : 'text-foreground/40 hover:text-foreground'}`}>Leaderboard</Link>
          
          {!loading && user ? (
            <>
              <div className="hidden lg:flex items-center gap-3 bg-foreground/[0.03] border border-border/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter">Lvl {userStats.lvl}</span>
                <div className="w-12 h-1 bg-foreground/10 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-foreground/60 rounded-full"></div>
                </div>
                <span className="text-[10px] font-bold text-foreground/60">{userStats.xp.toLocaleString()} XP</span>
              </div>
              <Link href={`/profile/${user.user_metadata.username || user.email}`} className={`text-sm font-bold tracking-tight transition-colors ${pathname.startsWith('/profile') ? 'text-foreground' : 'text-foreground/40 hover:text-foreground'}`}>Profile</Link>
              <button 
                onClick={handleSignOut}
                className="text-sm font-bold tracking-tight text-foreground/40 hover:text-foreground transition-colors"
              >
                Log Out
              </button>
            </>
          ) : !loading && (
            <Link href="/login" className="text-sm font-bold tracking-tight text-foreground/40 hover:text-foreground transition-colors">Log In</Link>
          )}

          {onShareClick && (
            <Button 
              onClick={onShareClick}
              variant="primary"
              className="font-bold px-5 py-2 h-9 rounded-full transition-all shadow-lg shadow-primary/10 active:scale-95 bg-foreground text-background hover:opacity-90 leading-none text-sm"
            >
              Share Prompt
            </Button>
          )}
        </nav>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-3">
          {onShareClick && (
            <Button 
              onClick={onShareClick}
              variant="primary"
              size="sm"
              className="font-bold py-1 h-8 rounded-full px-4 text-xs"
            >
              Share
            </Button>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-foreground/5 rounded-full text-foreground transition-colors border border-transparent hover:border-border/20"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full glass border-b border-border/20 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          <nav className="flex flex-col p-4 gap-2 relative">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-bold py-3 px-4 rounded-xl transition-colors ${pathname === '/' ? 'bg-foreground/10 text-foreground' : 'text-foreground/60'}`}
            >
              Explore
            </Link>
            <Link 
              href="/leaderboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-bold py-3 px-4 rounded-xl transition-colors ${pathname === '/leaderboard' ? 'bg-foreground/10 text-foreground' : 'text-foreground/60'}`}
            >
              Leaderboard
            </Link>
            {!loading && user ? (
              <>
                <Link 
                  href={`/profile/${user.user_metadata.username || user.email}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-bold py-3 px-4 rounded-xl transition-colors ${pathname.startsWith('/profile') ? 'bg-foreground/10 text-foreground' : 'text-foreground/60'}`}
                >
                  Profile
                </Link>
                <div className="flex items-center justify-between px-4 py-3 bg-foreground/5 rounded-xl border border-border/10">
                   <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-foreground/40 uppercase">Lvl {userStats.lvl}</span>
                     <span className="text-[10px] font-bold text-foreground/60">{userStats.xp.toLocaleString()} XP</span>
                   </div>
                   <button 
                    onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                    className="text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : !loading && (
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-bold py-3 px-4 rounded-xl text-foreground/60 hover:bg-foreground/5 transition-colors"
              >
                Log In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
