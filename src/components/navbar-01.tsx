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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

type NavItem = {
  label: string;
  href: string;
  section: string;
  tab?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '#dashboard', section: 'dashboard' },
  { label: 'Nodes', href: '#devices', section: 'devices', tab: 'device' },
  { label: 'Tasks', href: '#tasks', section: 'tasks' },
  { label: 'Administration', href: '#administration', section: 'administration' },
  { label: 'Performance', href: '#performance', section: 'performance' },
];

const REGION_OPTIONS = ['All', ...NORTH_AMERICAN_REGIONS] as const;

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
  /** Controlled region (when with onRegionChange) - single string for backward compat */
  region?: string;
  /** Controlled regions (multiselect) */
  regions?: string[];
  /** Callback when region changes (single - backward compat) */
  onRegionChange?: (region: string) => void;
  /** Callback when regions change (multiselect) */
  onRegionsChange?: (regions: string[]) => void;
  /** When set, region is fixed (single-region account); show label only, no dropdown */
  fixedRegion?: string;
  /** When true, the region selector is hidden regardless of section */
  hideRegionSelector?: boolean;
}

const Navbar01 = ({
  appName = 'AMS',
  onSignOut,
  onNavigate,
  className,
  leftAdornment,
  currentSection,
  region: regionProp,
  regions: regionsProp,
  onRegionChange,
  onRegionsChange,
  fixedRegion,
  hideRegionSelector,
}: Navbar01Props) => {
  const [internalRegions, setInternalRegions] = useState<string[]>(['All']);
  const regions = regionsProp ?? (regionProp != null ? [regionProp] : internalRegions);
  const setRegions = React.useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      if (onRegionsChange) {
        // Pass functional updater so parent always applies from its latest state (fixes multi-select when menu closes between clicks)
        if (typeof next === 'function') {
          onRegionsChange((parentPrev: string[]) => next(parentPrev));
        } else {
          onRegionsChange(next);
        }
      } else if (onRegionChange) {
        const value = typeof next === 'function' ? next(regions) : next;
        onRegionChange(value[0] ?? 'All');
      } else {
        const value = typeof next === 'function' ? next(internalRegions) : next;
        setInternalRegions(value);
      }
    },
    [regions, internalRegions, onRegionsChange, onRegionChange]
  );

  const toggleRegion = (r: string) => {
    setRegions((prev) => {
      if (r === 'All') {
        return prev.includes('All') ? [] : ['All'];
      }
      const next = prev.filter((x) => x !== 'All');
      const has = next.includes(r);
      if (has) {
        const filtered = next.filter((x) => x !== r);
        return filtered.length === 0 ? ['All'] : filtered;
      }
      return [...next, r];
    });
  };

  const isAll = regions.length === 0 || (regions.length === 1 && regions[0] === 'All');
  const regionDisplayList = isAll ? ['All'] : regions;
  const regionTriggerLabel =
    regionDisplayList.length === 0
      ? 'All'
      : regionDisplayList.length === 1
        ? regionDisplayList[0]
        : regionDisplayList.join(', ');
  const region = regions[0] ?? 'All';
  const [activeSection, setActiveSection] = useState<string>(currentSection ?? '');
  const getThemeKey = () => {
    try {
      const user = localStorage.getItem('ams-current-user');
      return user ? `ams-theme-${user}` : 'ams-theme';
    } catch { return 'ams-theme'; }
  };

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem(getThemeKey());
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch { /* ignore */ }
    return 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Apply theme class on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (currentSection) setActiveSection(currentSection);
  }, [currentSection]);

  function applyTheme(t: 'light' | 'dark' | 'system') {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    try {
      localStorage.setItem(getThemeKey(), newTheme);
    } catch { /* ignore */ }
  };

  const handleNavClick = (item: NavItem) => {
    setMobileMenuOpen(false);
    setActiveSection(item.section);
    onNavigate?.(item.section, item.tab);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-[1100] w-full border-b border-primary-foreground/20 bg-primary text-primary-foreground',
        className
      )}
    >
      <div className="relative flex h-14 w-full items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        {/* Left: sidebar trigger (optional) + logo */}
        <div className="flex shrink-0 items-center gap-2 min-w-0 sm:gap-4">
          {leftAdornment}
          <a
            href="#"
            className="flex shrink-0 items-center gap-4 text-primary-foreground min-w-0 sm:gap-6"
          >
            <img
              src="/Logo.svg"
              alt=""
              className="h-[16px] w-auto shrink-0 object-contain object-left"
              aria-hidden
            />
            <span className="hidden h-4 w-px bg-primary-foreground/30 sm:inline-block" aria-hidden />
            <span className="hidden text-lg font-bold tracking-tight sm:inline-block" style={{ WebkitTextStroke: '0.5px currentColor' }}>{appName}</span>
          </a>
        </div>

        {/* Desktop nav - absolute center (only from md up) */}
        <NavigationMenu className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
          <NavigationMenuList className="gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isSelected = activeSection === item.section;
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    href={item.href}
                    className={cn(navLinkClass, isSelected && 'bg-primary-foreground/20 font-semibold focus:bg-primary-foreground/20 active:bg-primary-foreground/20')}
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

        {/* Right: region (fixed label for single-region account, or multiselect dropdown) - hidden on administration */}
        <div className="hidden shrink-0 items-center gap-1 md:flex md:ml-auto">
          {currentSection !== 'administration' && !hideRegionSelector && (
            fixedRegion != null ? (
              <div
                className={cn(
                  'flex w-[140px] items-center justify-center border border-primary-foreground/30 bg-transparent px-3 py-2 text-primary-foreground text-sm'
                )}
                title={fixedRegion}
              >
                <span className="truncate">{fixedRegion}</span>
              </div>
            ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  title={regionTriggerLabel}
                  className={cn(
                    'group w-[140px] justify-between gap-2 border border-primary-foreground/30 bg-transparent text-primary-foreground',
                    'hover:bg-white/20 hover:text-white hover:border-white/40 [&>svg]:shrink-0 [&>svg]:text-primary-foreground hover:[&>svg]:text-white'
                  )}
                >
                  <span className="min-w-0 truncate text-left">{regionTriggerLabel}</span>
                  <div className="flex shrink-0 items-center gap-1">
                    {!isAll && regions.length > 1 && (
                      <Badge variant="secondary" className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums bg-primary-foreground/20 text-primary-foreground border-0 group-hover:bg-white/30 group-hover:text-white">
                        {regions.length}
                      </Badge>
                    )}
                    <Icon name="expand_more" size={18} />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="z-[9999] w-[240px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuLabel>Regions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {REGION_OPTIONS.map((r) => {
                  const checked = r === 'All' ? isAll : regions.includes(r);
                  return (
                    <DropdownMenuItem
                      key={r}
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleRegion(r);
                      }}
                      className="cursor-pointer focus:bg-accent"
                    >
                      <label className="flex cursor-pointer items-center gap-3 w-full py-0.5 pointer-events-none">
                        <Checkbox
                          checked={checked}
                          aria-label={`Select ${r}`}
                          tabIndex={-1}
                          className="pointer-events-none"
                        />
                        <span>{r}</span>
                      </label>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            )
          )}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                aria-label="Theme"
              >
                <Icon name={theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'contrast'} size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4} className="z-[9999]">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                <Icon name="light_mode" size={16} className="mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                <Icon name="dark_mode" size={16} className="mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                <Icon name="contrast" size={16} className="mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 border border-primary-foreground/30">
                  <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4} className="z-[9999] w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="person" size={16} className="mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="settings" size={16} className="mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate?.('design-system')}>
                <Icon name="palette" size={16} className="mr-2" />
                Design System
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <Icon name="logout" size={16} className="mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile menu - hamburger on the right */}
        <div className="flex shrink-0 items-center md:hidden md:ml-auto">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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
              <SheetTitle className="flex items-center gap-4 text-left text-lg tracking-tight">
                <img
                  src="/Logo.svg"
                  alt=""
                  className="h-[16px] w-auto object-contain object-left"
                  aria-hidden
                />
                <span className="h-4 w-px bg-border" aria-hidden />
                <span className="font-bold">{appName}</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 mt-8">
              {NAV_ITEMS.map((item) => {
                const isSelected = activeSection === item.section;
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn('justify-start active:bg-transparent', isSelected && 'bg-muted font-semibold active:bg-muted')}
                    aria-current={isSelected ? 'page' : undefined}
                    onClick={() => handleNavClick(item)}
                  >
                    {item.label}
                  </Button>
                );
              })}
              <div className="border-t border-border pt-4 mt-4">
                {currentSection !== 'administration' && !hideRegionSelector && (
                  <>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Region</p>
                    {fixedRegion != null ? (
                      <p className="text-sm py-1.5">{fixedRegion}</p>
                    ) : (
                    <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto mb-4">
                      {REGION_OPTIONS.map((r) => (
                        <label key={r} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm">
                          <Checkbox
                            checked={r === 'All' ? regions.includes('All') || regions.length === 0 : regions.includes(r)}
                            onCheckedChange={() => toggleRegion(r)}
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" aria-label="Connection status">
                    <Icon name="wifi" size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Alerts">
                    <Icon name="notifications" size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Help">
                    <Icon name="help" size={16} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Theme">
                        <Icon name={theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'contrast'} size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Theme</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                        <Icon name="light_mode" size={16} className="mr-2" />
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                        <Icon name="dark_mode" size={16} className="mr-2" />
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                        <Icon name="contrast" size={16} className="mr-2" />
                        System
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">U</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Icon name="person" size={16} className="mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Icon name="settings" size={16} className="mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onNavigate?.('design-system')}>
                        <Icon name="palette" size={16} className="mr-2" />
                        Design System
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onSignOut}>
                        <Icon name="logout" size={16} className="mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
