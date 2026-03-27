import React from 'react';
import { Header } from '@/components/Header';
import Link from 'next/link';

const leaderboardData = [
  { rank: 1, username: "frontend_ninja", xp: 12450, badge: "💎 Elite", level: 42 },
  { rank: 2, username: "curious_george", xp: 9230, badge: "🥇 Expert", level: 35 },
  { rank: 3, username: "ai_whisperer", xp: 8100, badge: "🥈 Pro", level: 31 },
  { rank: 4, username: "prompt_god", xp: 6500, badge: "🥉 Advanced", level: 27 },
  { rank: 5, username: "code_bot", xp: 5400, badge: "🚀 Rising", level: 24 },
  { rank: 12, username: "current_user", xp: 3450, badge: "🔥 Contributor", level: 12, isCurrent: true },
];

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Global Leaderboard</h1>
            <p className="text-foreground/60 mt-1">Top prompt engineers this week.</p>
          </div>
          <div className="hidden sm:flex bg-card border border-border rounded-lg p-1 shadow-sm">
            <button className="px-3 py-1 text-sm font-semibold bg-foreground/5 text-foreground rounded-md">This Week</button>
            <button className="px-3 py-1 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">All Time</button>
          </div>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-foreground/5 text-xs font-semibold text-foreground/50 uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6 sm:col-span-6">Prompt Engineer</div>
            <div className="col-span-2 sm:col-span-2 text-center">Level</div>
            <div className="col-span-3 text-right">Total XP</div>
          </div>
          <div className="flex flex-col">
            {leaderboardData.map((user) => (
              <div 
                key={user.rank} 
                className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-border/50 last:border-0 hover:bg-foreground/[0.02] transition-colors ${user.isCurrent ? 'bg-primary/5' : ''}`}
              >
                <div className="col-span-1 flex justify-center">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800' : user.rank === 2 ? 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300' : user.rank === 3 ? 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' : 'text-foreground/60 font-medium'}`}>
                    {user.rank}
                  </span>
                </div>
                <div className="col-span-6 sm:col-span-6 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <Link href={`/profile/${user.username}`} className="font-semibold text-foreground hover:underline hover:text-primary transition-colors">
                    @{user.username}
                  </Link>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-border/50 bg-background text-foreground/70 w-fit">
                    {user.badge}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-2 text-center">
                  <span className="text-sm font-medium text-foreground/80">Lvl {user.level}</span>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{user.xp.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
