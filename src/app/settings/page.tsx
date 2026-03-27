import React from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-8">Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex flex-col gap-1">
            <button className="text-left px-3 py-2 text-sm font-semibold bg-foreground/5 text-foreground rounded-md w-full">Account Profile</button>
            <button className="text-left px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-md w-full transition-colors">Appearance</button>
            <button className="text-left px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/5 rounded-md w-full transition-colors">Notifications</button>
            <button className="text-left px-3 py-2 text-sm font-medium text-red-600/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md w-full transition-colors mt-4">Danger Zone</button>
          </div>

          <div className="flex-1 flex flex-col gap-8">
            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Public Profile</h2>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Username</label>
                  <input type="text" defaultValue="current_user" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea defaultValue="React developer exploring the power of LLMs. Need a robust prompt? You've come to the right place." className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-24" />
                </div>
                <div className="pt-2">
                  <Button variant="primary" size="sm">Save Profile</Button>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Linked Accounts</h2>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg mb-3">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Google</p>
                    <p className="text-xs text-foreground/50">current_user@gmail.com</p>
                  </div>
                </div>
                <button className="text-sm font-medium text-foreground/50 hover:text-red-500 transition-colors">Disconnect</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
