'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Devices', href: '#devices' },
  { label: 'Tasks', href: '#tasks' },
  { label: 'Administration', href: '#administration' },
  { label: 'Performance', href: '#performance' },
] as const;

const REGIONS = NORTH_AMERICAN_REGIONS;

const navLinkClass = cn(
  navigationMenuTriggerStyle(),
  'bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground focus:bg-transparent focus:text-primary-foreground active:bg-transparent active:text-primary-foreground data-[state=open]:bg-primary-foreground/10'
);

export interface Navbar01Props {
  className?: string;
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  /** Rendered at the start of the navbar (e.g. SidebarTrigger) */
  leftAdornment?: React.ReactNode;
  /** Current section for nav highlight (e.g. 'dashboard', 'devices') */
  currentSection?: string;
  /** Controlled region (when with onRegionChange) */
  region?: string;
  /** Callback when region changes */
  onRegionChange?: (region: string) => void;
}

const Navbar01 = ({
  appName = 'vSNET',
  onSignOut,
  onNavigate,
  className,
  leftAdornment,
  currentSection,
  region: regionProp,
  onRegionChange,
}: Navbar01Props) => {
  const [internalRegion, setInternalRegion] = useState<string>(REGIONS[0]);
  const region = regionProp ?? internalRegion;
  const setRegion = onRegionChange ?? setInternalRegion;
  const [activeSection, setActiveSection] = useState<string>(currentSection ?? '');

  useEffect(() => {
    if (currentSection) setActiveSection(currentSection);
  }, [currentSection]);

  const handleNavClick = (item: (typeof NAV_ITEMS)[number]) => {
    const section = item.label.toLowerCase();
    setActiveSection(section);
    if (item.label === 'Dashboard') {
      onNavigate?.(section);
    } else if (item.label === 'Devices') {
      onNavigate?.(section, 'device');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-primary-foreground/20 bg-primary text-primary-foreground',
        className
      )}
    >
      <div className="relative flex h-14 w-full items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        {/* Left: sidebar trigger (optional) + logo */}
        <div className="flex shrink-0 items-center gap-2 min-w-0 sm:gap-4">
          {leftAdornment}
          <a
            href="#"
            className="flex shrink-0 items-center gap-4 font-semibold text-primary-foreground min-w-0 sm:gap-6"
          >
            <img
              src="/Logo.svg"
              alt=""
              className="h-[16px] w-auto shrink-0 object-contain object-left"
              aria-hidden
            />
            <span className="hidden text-lg tracking-tight sm:inline-block">{appName}</span>
          </a>
        </div>

        {/* Desktop nav - absolute center (only from md up) */}
        <NavigationMenu className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
          <NavigationMenuList className="gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isSelected = activeSection === item.label.toLowerCase();
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    href={item.href}
                    className={cn(navLinkClass, isSelected && 'bg-primary-foreground/5 focus:bg-primary-foreground/5 active:bg-primary-foreground/5')}
                    aria-current={isSelected ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item);
                    }}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right: region, icon buttons, avatar (desktop) */}
        <div className="hidden shrink-0 items-center gap-1 md:flex md:ml-auto">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger
              className={cn(
                'w-[140px] border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 [&>svg]:text-primary-foreground [&>span]:text-primary-foreground'
              )}
            >
              <SelectValue>{region}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Connection status"
          >
            <Icon name="wifi" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Alerts"
          >
            <Icon name="notifications" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Help"
          >
            <Icon name="help" size={16} />
          </Button>
          <Avatar className="h-8 w-8 border border-primary-foreground/30">
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs">
              U
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Mobile menu - hamburger on the right */}
        <div className="flex shrink-0 items-center md:hidden md:ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                aria-label="Open menu"
              >
                <Icon name="menu" size={20} />
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-6 text-left text-lg tracking-tight">
                <img
                  src="/Logo.svg"
                  alt=""
                  className="h-[16px] w-auto object-contain object-left"
                  aria-hidden
                />
                {appName}
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 mt-8">
              {NAV_ITEMS.map((item) => {
                const isSelected = activeSection === item.label.toLowerCase();
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn('justify-start active:bg-transparent', isSelected && 'bg-muted/60 active:bg-muted/60')}
                    aria-current={isSelected ? 'page' : undefined}
                    onClick={() => handleNavClick(item)}
                  >
                    {item.label}
                  </Button>
                );
              })}
              <div className="border-t border-border pt-4 mt-4">
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-full mb-2">Region</SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="ghost" size="icon" aria-label="Connection status">
                    <Icon name="wifi" size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Alerts">
                    <Icon name="notifications" size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Help">
                    <Icon name="help" size={16} />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </nav>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export { Navbar01 };
