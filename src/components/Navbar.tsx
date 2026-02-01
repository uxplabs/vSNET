import React from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

export interface NavbarProps {
  appName?: string;
  onSignOut?: () => void;
  className?: string;
}

function Navbar({ appName = 'vSNET', onSignOut, className }: NavbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-14 items-center px-4">
        <a href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <img
            src="/Logo.svg"
            alt=""
            className="h-8 w-auto object-contain"
            aria-hidden
          />
          <span className="hidden sm:inline-block">{appName}</span>
        </a>
        <nav className="ml-6 flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <a href="#dashboard">Dashboard</a>
          </Button>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
