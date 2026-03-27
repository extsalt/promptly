"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./Button";

interface HeaderProps {
  onShareClick?: () => void;
}

export function Header({ onShareClick }: HeaderProps) {
  const pathname = usePathname();
  
  // Mocked state: logged in user
  // In a real app this would come from a NextAuth session or Context provider
  const isLoggedIn = true; 
  const user = { username: "current_user", lvl: 12, xp: 3450 };

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
          
          {isLoggedIn ? (
            <>
              <div className="hidden lg:flex items-center gap-2 bg-foreground/5 border border-border px-3 py-1.5 rounded-md mx-1">
                <span className="text-xs font-bold text-foreground/70">Lvl {user.lvl}</span>
                <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">{user.xp.toLocaleString()} XP</span>
              </div>
              <Link href="/profile/current_user" className={`text-sm font-medium transition-colors ${pathname.startsWith('/profile') ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>Profile</Link>
              <Link href="/settings" className={`text-sm font-medium transition-colors ${pathname.startsWith('/settings') ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>Settings</Link>
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Log In</Link>
          )}

          {onShareClick && (
            <Button 
              onClick={onShareClick}
              variant="primary"
              size="sm"
            >
              Share Prompt
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
