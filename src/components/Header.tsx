'use client';

import React from 'react';
import { Clock, BookOpen, Terminal, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenCheatSheet: () => void;
}

export function Header({ onOpenCheatSheet }: HeaderProps): React.JSX.Element {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
            <Clock className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xl tracking-tight text-foreground">
                cronlens
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3 h-3" /> ready
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              inspect schedules before they run
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenCheatSheet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent border border-border transition-colors cursor-pointer"
            title="Open Cron Syntax Cheat Sheet"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Cheat Sheet</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs border border-border">
            <Terminal className="w-3.5 h-3.5" />
            <span>crontab -e</span>
          </div>
        </div>
      </div>
    </header>
  );
}
