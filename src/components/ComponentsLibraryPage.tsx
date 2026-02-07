import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { AspectRatio } from './ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Calendar } from './ui/calendar';
import { Checkbox } from './ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Skeleton } from './ui/skeleton';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsListUnderline, TabsTrigger, TabsTriggerUnderline } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Toggle } from './ui/toggle';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Kbd, KbdGroup } from './ui/kbd';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty';
import { Icon } from './Icon';
import { StatCard } from './ui/stat-card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from './ui/hover-card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Spinner } from './ui/spinner';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { DeviceStatus } from './ui/device-status';
import { cn } from '@/lib/utils';

// Navigation structure for sidebar
const NAV_SECTIONS = [
  {
    category: 'forms',
    title: 'Forms',
    items: [
      { id: 'button', label: 'Button' },
      { id: 'button-group', label: 'Button Group' },
      { id: 'input', label: 'Input' },
      { id: 'textarea', label: 'Textarea' },
      { id: 'select', label: 'Select' },
      { id: 'checkbox', label: 'Checkbox' },
      { id: 'radio-group', label: 'Radio Group' },
      { id: 'switch', label: 'Switch' },
      { id: 'slider', label: 'Slider' },
      { id: 'toggle', label: 'Toggle' },
      { id: 'calendar', label: 'Calendar' },
    ],
  },
  {
    category: 'feedback',
    title: 'Feedback',
    items: [
      { id: 'alert', label: 'Alert' },
      { id: 'badge', label: 'Badge' },
      { id: 'progress', label: 'Progress' },
      { id: 'spinner', label: 'Spinner' },
      { id: 'skeleton', label: 'Skeleton' },
      { id: 'toast', label: 'Toast' },
      { id: 'empty-state', label: 'Empty State' },
      { id: 'device-status', label: 'Device Status' },
    ],
  },
  {
    category: 'navigation',
    title: 'Navigation',
    items: [
      { id: 'tabs-pill', label: 'Tabs (Pill)' },
      { id: 'tabs-underline', label: 'Tabs (Underline)' },
      { id: 'breadcrumb', label: 'Breadcrumb' },
      { id: 'dropdown-menu', label: 'Dropdown Menu' },
      { id: 'pagination', label: 'Pagination' },
      { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts' },
    ],
  },
  {
    category: 'layout',
    title: 'Layout',
    items: [
      { id: 'card', label: 'Card' },
      { id: 'metric-card', label: 'Stat Card' },
      { id: 'accordion', label: 'Accordion' },
      { id: 'collapsible', label: 'Collapsible' },
      { id: 'separator', label: 'Separator' },
      { id: 'aspect-ratio', label: 'Aspect Ratio' },
      { id: 'scroll-area', label: 'Scroll Area' },
    ],
  },
  {
    category: 'data-display',
    title: 'Data Display',
    items: [
      { id: 'table', label: 'Table' },
      { id: 'avatar', label: 'Avatar' },
      { id: 'tooltip', label: 'Tooltip' },
      { id: 'hover-card', label: 'Hover Card' },
    ],
  },
  {
    category: 'overlays',
    title: 'Overlays',
    items: [
      { id: 'dialog', label: 'Dialog' },
      { id: 'alert-dialog', label: 'Alert Dialog' },
      { id: 'sheet', label: 'Sheet' },
      { id: 'popover', label: 'Popover' },
    ],
  },
  {
    category: 'icons',
    title: 'Icons',
    items: [
      { id: 'material-icons', label: 'Material Icons' },
      { id: 'icon-usage', label: 'Icon Usage' },
    ],
  },
];

// Category header component
function CategoryHeader({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div id={id} className="mb-6 scroll-mt-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

// Component card with consistent styling
function ComponentCard({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Sidebar navigation component
function SidebarNav({ activeSection, activeCategory }: { activeSection: string; activeCategory: string }) {
  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredSections = activeCategory === 'all' 
    ? NAV_SECTIONS 
    : NAV_SECTIONS.filter(s => s.category === activeCategory);

  return (
    <nav className="space-y-4">
      {filteredSections.map((section) => (
        <div key={section.category}>
          <h4 className="text-sm font-semibold text-foreground mb-2">{section.title}</h4>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToElement(item.id)}
                  className={cn(
                    "w-full text-left text-sm px-2 py-1 rounded-md transition-colors",
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ComponentsLibraryPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sliderVal, setSliderVal] = useState([50]);
  const [switchOn, setSwitchOn] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('');

  // Track scroll position to highlight active section in sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    // Observe all component cards
    const allItems = NAV_SECTIONS.flatMap(s => s.items);
    allItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [activeCategory]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'forms', label: 'Forms' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'layout', label: 'Layout' },
    { id: 'data-display', label: 'Data Display' },
    { id: 'overlays', label: 'Overlays' },
    { id: 'icons', label: 'Icons' },
  ];

  return (
    <TooltipProvider>
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-0 pt-2">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <SidebarNav activeSection={activeSection} activeCategory={activeCategory} />
            </ScrollArea>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle>shadcn/ui Component Library</CardTitle>
              <CardDescription>
                All components added via <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">npx shadcn@latest add</code>. Using Segoe UI typeface and Material Icons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsListUnderline className="w-full justify-start overflow-x-auto">
                  {categories.map((cat) => (
                    <TabsTriggerUnderline key={cat.id} value={cat.id}>
                      {cat.label}
                    </TabsTriggerUnderline>
                  ))}
                </TabsListUnderline>
              </Tabs>
            </CardContent>
          </Card>

        {/* FORMS SECTION */}
        {(activeCategory === 'all' || activeCategory === 'forms') && (
          <section className="space-y-6">
            <CategoryHeader id="forms-section" title="Forms" description="Input components for collecting user data" />
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Button */}
              <ComponentCard id="button" title="Button" description="Clickable elements with multiple variants and sizes">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Icon name="add" size={18} /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button disabled>Disabled</Button>
                    <Button>
                      <Icon name="download" size={16} className="mr-2" />
                      With Icon
                    </Button>
                  </div>
                </div>
              </ComponentCard>

              {/* Button Group */}
              <ComponentCard id="button-group" title="Button Group" description="Group related buttons together">
                <div className="space-y-4">
                  <ButtonGroup>
                    <Button variant="outline">Left</Button>
                    <Button variant="outline">Center</Button>
                    <Button variant="outline">Right</Button>
                  </ButtonGroup>
                  <ButtonGroup>
                    <Button variant="secondary" size="sm">Day</Button>
                    <Button variant="secondary" size="sm">Week</Button>
                    <Button variant="secondary" size="sm">Month</Button>
                  </ButtonGroup>
                </div>
              </ComponentCard>

              {/* Input */}
              <ComponentCard id="input" title="Input" description="Text input with label and states">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="input-default">Default</Label>
                    <Input id="input-default" placeholder="Enter text..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-disabled">Disabled</Label>
                    <Input id="input-disabled" placeholder="Disabled input" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-icon">With icon</Label>
                    <div className="relative">
                      <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="input-icon" placeholder="Search..." className="pl-9" />
                    </div>
                  </div>
                </div>
              </ComponentCard>

              {/* Textarea */}
              <ComponentCard id="textarea" title="Textarea" description="Multi-line text input">
                <div className="space-y-2">
                  <Label htmlFor="textarea-demo">Description</Label>
                  <Textarea id="textarea-demo" placeholder="Enter a description..." rows={3} />
                </div>
              </ComponentCard>

              {/* Select */}
              <ComponentCard id="select" title="Select" description="Dropdown selection">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default</Label>
                    <Select>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Option 1</SelectItem>
                        <SelectItem value="2">Option 2</SelectItem>
                        <SelectItem value="3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Disabled</Label>
                    <Select disabled>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Disabled" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Option 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ComponentCard>

              {/* Checkbox */}
              <ComponentCard id="checkbox" title="Checkbox" description="Multiple selection control">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cb-1" checked={checkboxChecked} onCheckedChange={(v) => setCheckboxChecked(!!v)} />
                    <Label htmlFor="cb-1">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cb-2" defaultChecked />
                    <Label htmlFor="cb-2">Checked by default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cb-3" disabled />
                    <Label htmlFor="cb-3" className="text-muted-foreground">Disabled</Label>
                  </div>
                </div>
              </ComponentCard>

              {/* Radio Group */}
              <ComponentCard id="radio-group" title="Radio Group" description="Single selection from options">
                <RadioGroup defaultValue="option-1" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-1" id="r-1" />
                    <Label htmlFor="r-1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-2" id="r-2" />
                    <Label htmlFor="r-2">Option 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-3" id="r-3" disabled />
                    <Label htmlFor="r-3" className="text-muted-foreground">Option 3 (disabled)</Label>
                  </div>
                </RadioGroup>
              </ComponentCard>

              {/* Switch */}
              <ComponentCard id="switch" title="Switch" description="Toggle on/off control">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sw-1">Notifications</Label>
                    <Switch id="sw-1" checked={switchOn} onCheckedChange={setSwitchOn} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sw-2" className="text-muted-foreground">Disabled</Label>
                    <Switch id="sw-2" disabled />
                  </div>
                </div>
              </ComponentCard>

              {/* Slider */}
              <ComponentCard id="slider" title="Slider" description="Range input control">
                <div className="space-y-4">
                  <Slider value={sliderVal} onValueChange={setSliderVal} max={100} step={1} className="w-full" />
                  <p className="text-sm text-muted-foreground">Value: {sliderVal[0]}</p>
                </div>
              </ComponentCard>

              {/* Toggle */}
              <ComponentCard id="toggle" title="Toggle & Toggle Group" description="Single or multi-select toggle buttons">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Toggle aria-label="Toggle bold">
                      <Icon name="format_bold" size={16} />
                    </Toggle>
                    <Toggle aria-label="Toggle italic">
                      <Icon name="format_italic" size={16} />
                    </Toggle>
                    <Toggle aria-label="Toggle underline">
                      <Icon name="format_underlined" size={16} />
                    </Toggle>
                  </div>
                  <ToggleGroup type="single" defaultValue="left">
                    <ToggleGroupItem value="left" aria-label="Align left">
                      <Icon name="format_align_left" size={16} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" aria-label="Align center">
                      <Icon name="format_align_center" size={16} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" aria-label="Align right">
                      <Icon name="format_align_right" size={16} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </ComponentCard>

            </div>

            {/* Calendar - outside grid for proper sizing */}
            <Card id="calendar" className="scroll-mt-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Calendar</CardTitle>
                <CardDescription>Date picker component for selecting dates</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={new Date()}
                />
              </CardContent>
            </Card>
          </section>
        )}

        {/* FEEDBACK SECTION */}
        {(activeCategory === 'all' || activeCategory === 'feedback') && (
          <section className="space-y-6">
            <CategoryHeader id="feedback-section" title="Feedback" description="Components for user feedback and status" />
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Alert */}
              <ComponentCard id="alert" title="Alert" description="Contextual feedback messages">
                <div className="space-y-3">
                  <Alert>
                    <Icon name="info" size={16} className="mr-2" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>This is a default informational alert.</AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <Icon name="error" size={16} className="mr-2" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Something went wrong. Please try again.</AlertDescription>
                  </Alert>
                </div>
              </ComponentCard>

              {/* Badge */}
              <ComponentCard id="badge" title="Badge" description="Status indicators and labels">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Success</Badge>
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Warning</Badge>
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Info</Badge>
                  </div>
                </div>
              </ComponentCard>

              {/* Progress */}
              <ComponentCard id="progress" title="Progress" description="Loading and completion indicator">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="text-muted-foreground">60%</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Loading</span>
                      <span className="text-muted-foreground">25%</span>
                    </div>
                    <Progress value={25} />
                  </div>
                </div>
              </ComponentCard>

              {/* Spinner */}
              <ComponentCard id="spinner" title="Spinner" description="Loading indicator">
                <div className="flex items-center gap-4">
                  <Spinner className="h-4 w-4" />
                  <Spinner className="h-6 w-6" />
                  <Spinner className="h-8 w-8" />
                  <Button disabled>
                    <Spinner className="h-4 w-4 mr-2" />
                    Loading...
                  </Button>
                </div>
              </ComponentCard>

              {/* Skeleton */}
              <ComponentCard id="skeleton" title="Skeleton" description="Content loading placeholder">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </ComponentCard>

              {/* Toast */}
              <ComponentCard id="toast" title="Toast (Sonner)" description="Notification messages">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => toast('Default toast message')}>
                    Default
                  </Button>
                  <Button variant="outline" onClick={() => toast.success('Operation completed successfully!')}>
                    Success
                  </Button>
                  <Button variant="outline" onClick={() => toast.error('Something went wrong')}>
                    Error
                  </Button>
                  <Button variant="outline" onClick={() => toast.warning('Please review your input')}>
                    Warning
                  </Button>
                </div>
              </ComponentCard>

              {/* Empty State */}
              <ComponentCard id="empty-state" title="Empty State" description="Placeholder for empty content">
                <Empty>
                  <EmptyMedia>
                    <Icon name="inbox" size={48} className="text-muted-foreground/50" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No items found</EmptyTitle>
                    <EmptyDescription>Get started by creating your first item.</EmptyDescription>
                  </EmptyHeader>
                  <Button size="sm">
                    <Icon name="add" size={16} className="mr-2" />
                    Create item
                  </Button>
                </Empty>
              </ComponentCard>

              {/* Device Status */}
              <ComponentCard id="device-status" title="Device Status" description="Custom status indicators for devices">
                <div className="flex flex-wrap gap-4">
                  <DeviceStatus status="Connected" />
                  <DeviceStatus status="Disconnected" />
                  <DeviceStatus status="In maintenance" />
                  <DeviceStatus status="Offline" />
                </div>
              </ComponentCard>
            </div>
          </section>
        )}

        {/* NAVIGATION SECTION */}
        {(activeCategory === 'all' || activeCategory === 'navigation') && (
          <section className="space-y-6">
            <CategoryHeader id="navigation-section" title="Navigation" description="Components for navigation and menus" />
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Tabs - Pill Style */}
              <ComponentCard id="tabs-pill" title="Tabs (Pill Style)" description="Default tabbed content navigation">
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList>
                    <TabsTrigger value="tab1">Account</TabsTrigger>
                    <TabsTrigger value="tab2">Security</TabsTrigger>
                    <TabsTrigger value="tab3">Notifications</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="text-sm text-muted-foreground">Account settings content.</TabsContent>
                  <TabsContent value="tab2" className="text-sm text-muted-foreground">Security settings content.</TabsContent>
                  <TabsContent value="tab3" className="text-sm text-muted-foreground">Notification settings content.</TabsContent>
                </Tabs>
              </ComponentCard>

              {/* Tabs - Underline Style */}
              <ComponentCard id="tabs-underline" title="Tabs (Underline Style)" description="Underline tabbed content navigation">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsListUnderline>
                    <TabsTriggerUnderline value="overview">Overview</TabsTriggerUnderline>
                    <TabsTriggerUnderline value="analytics">Analytics</TabsTriggerUnderline>
                    <TabsTriggerUnderline value="reports">Reports</TabsTriggerUnderline>
                  </TabsListUnderline>
                  <TabsContent value="overview" className="text-sm text-muted-foreground pt-4">Overview content.</TabsContent>
                  <TabsContent value="analytics" className="text-sm text-muted-foreground pt-4">Analytics content.</TabsContent>
                  <TabsContent value="reports" className="text-sm text-muted-foreground pt-4">Reports content.</TabsContent>
                </Tabs>
              </ComponentCard>

              {/* Breadcrumb */}
              <ComponentCard id="breadcrumb" title="Breadcrumb" description="Navigation path indicator">
                <div className="space-y-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Profile</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </ComponentCard>

              {/* Dropdown Menu */}
              <ComponentCard id="dropdown-menu" title="Dropdown Menu" description="Contextual action menu">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions
                      <Icon name="expand_more" size={16} className="ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
                    <DropdownMenuItem className="text-destructive">
                      <Icon name="logout" size={16} className="mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ComponentCard>

              {/* Pagination */}
              <ComponentCard id="pagination" title="Pagination" description="Page navigation controls">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </ComponentCard>

              {/* Kbd */}
              <ComponentCard id="keyboard-shortcuts" title="Keyboard Shortcuts" description="Display keyboard shortcuts">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Search</span>
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>K</Kbd>
                    </KbdGroup>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Save</span>
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>S</Kbd>
                    </KbdGroup>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Undo</span>
                    <KbdGroup>
                      <Kbd>⌘</Kbd>
                      <Kbd>Z</Kbd>
                    </KbdGroup>
                  </div>
                </div>
              </ComponentCard>
            </div>
          </section>
        )}

        {/* LAYOUT SECTION */}
        {(activeCategory === 'all' || activeCategory === 'layout') && (
          <section className="space-y-6">
            <CategoryHeader id="layout-section" title="Layout" description="Components for page structure and organization" />
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Card */}
              <ComponentCard id="card" title="Card" description="Container with header and content">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Card Title</CardTitle>
                    <CardDescription>Card description text goes here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Card content area.</p>
                  </CardContent>
                </Card>
              </ComponentCard>

              {/* Stat Card (Tailwind UI pattern) */}
              <ComponentCard id="metric-card" title="Stat Card" description="Tailwind UI stats pattern with semantic dl/dt/dd">
                <div className="space-y-4">
                  <StatCard
                    name="Total Revenue"
                    value="$45,231"
                    icon={<Icon name="attach_money" size={16} />}
                    change="20.1%"
                    changeDirection="up"
                    changeLabel="from last month"
                  />
                  <StatCard
                    name="Active Users"
                    value="2,350"
                    icon={<Icon name="group" size={16} />}
                    change="5%"
                    changeDirection="down"
                    changeLabel="from last week"
                  />
                </div>
              </ComponentCard>

              {/* Accordion */}
              <ComponentCard id="accordion" title="Accordion" description="Collapsible content sections">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is this?</AccordionTrigger>
                    <AccordionContent>
                      This is an accordion component for organizing content into collapsible sections.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How does it work?</AccordionTrigger>
                    <AccordionContent>
                      Click on any header to expand or collapse its content panel.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ComponentCard>

              {/* Collapsible */}
              <ComponentCard id="collapsible" title="Collapsible" description="Single collapsible section">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Show more
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <p className="text-sm text-muted-foreground">
                      This content is hidden by default and revealed when expanded.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </ComponentCard>

              {/* Separator */}
              <ComponentCard id="separator" title="Separator" description="Visual divider between content">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Left</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-sm">Center</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-sm">Right</span>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">Content below separator</p>
                </div>
              </ComponentCard>

              {/* Aspect Ratio */}
              <ComponentCard id="aspect-ratio" title="Aspect Ratio" description="Maintain consistent proportions">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <AspectRatio ratio={1} className="bg-muted rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">1:1</span>
                    </AspectRatio>
                  </div>
                  <div>
                    <AspectRatio ratio={4/3} className="bg-muted rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">4:3</span>
                    </AspectRatio>
                  </div>
                  <div>
                    <AspectRatio ratio={16/9} className="bg-muted rounded-md flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">16:9</span>
                    </AspectRatio>
                  </div>
                </div>
              </ComponentCard>

              {/* Scroll Area */}
              <ComponentCard id="scroll-area" title="Scroll Area" description="Custom scrollable container">
                <ScrollArea className="h-32 w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <p key={i} className="text-sm">
                        Scrollable item {i + 1}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </ComponentCard>
            </div>
          </section>
        )}

        {/* DATA DISPLAY SECTION */}
        {(activeCategory === 'all' || activeCategory === 'data-display') && (
          <section className="space-y-6">
            <CategoryHeader id="data-display-section" title="Data Display" description="Components for displaying data and content" />
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Table */}
              <ComponentCard id="table" title="Table" description="Display tabular data">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Item A</TableCell>
                      <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                      <TableCell className="text-right">$100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Item B</TableCell>
                      <TableCell><Badge variant="outline">Pending</Badge></TableCell>
                      <TableCell className="text-right">$200</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Item C</TableCell>
                      <TableCell><Badge variant="destructive">Inactive</Badge></TableCell>
                      <TableCell className="text-right">$300</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ComponentCard>

              {/* Avatar */}
              <ComponentCard id="avatar" title="Avatar" description="User profile images with fallback">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">AB</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                </div>
              </ComponentCard>

              {/* Tooltip */}
              <ComponentCard id="tooltip" title="Tooltip" description="Contextual information on hover">
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Icon name="info" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Icon name="help" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Tooltip on right</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Icon name="settings" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Tooltip on bottom</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </ComponentCard>

              {/* Hover Card */}
              <ComponentCard id="hover-card" title="Hover Card" description="Rich content on hover">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link" className="p-0 h-auto">@username</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>UN</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">@username</h4>
                        <p className="text-sm text-muted-foreground">
                          Software developer. Building cool things.
                        </p>
                        <div className="flex items-center pt-2">
                          <Icon name="calendar_today" size={14} className="mr-2 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Joined December 2021</span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </ComponentCard>
            </div>
          </section>
        )}

        {/* OVERLAYS SECTION */}
        {(activeCategory === 'all' || activeCategory === 'overlays') && (
          <section className="space-y-6">
            <CategoryHeader id="overlays-section" title="Overlays" description="Modal and overlay components" />
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Dialog */}
              <ComponentCard id="dialog" title="Dialog" description="Modal dialog for focused tasks">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Enter your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Enter your email" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </ComponentCard>

              {/* Alert Dialog */}
              <ComponentCard id="alert-dialog" title="Alert Dialog" description="Confirmation dialog for critical actions">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Item</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your item and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </ComponentCard>

              {/* Sheet */}
              <ComponentCard id="sheet" title="Sheet" description="Slide-out panel from edge">
                <div className="flex gap-2">
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline">Open Sheet</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Sheet Title</SheetTitle>
                        <SheetDescription>
                          This is a slide-out panel that appears from the edge of the screen.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6">
                        <p className="text-sm text-muted-foreground">Sheet content goes here.</p>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </ComponentCard>

              {/* Popover */}
              <ComponentCard id="popover" title="Popover" description="Floating content panel">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium leading-none">Dimensions</h4>
                      <p className="text-sm text-muted-foreground">
                        Set the dimensions for the layer.
                      </p>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Width</Label>
                          <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">Height</Label>
                          <Input id="height" defaultValue="auto" className="col-span-2 h-8" />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </ComponentCard>
            </div>
          </section>
        )}

        {/* ICONS SECTION */}
        {(activeCategory === 'all' || activeCategory === 'icons') && (
          <section className="space-y-6">
            <CategoryHeader id="icons-section" title="Icons" description="Material Icons integration" />
            
            <Card id="material-icons" className="scroll-mt-4">
              <CardHeader>
                <CardTitle className="text-base">Material Icons</CardTitle>
                <CardDescription>
                  Using Google Material Icons via the Icon component. Pass the icon name and optional size.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">Common Actions</p>
                  <div className="flex flex-wrap gap-4">
                    {['add', 'remove', 'edit', 'delete', 'save', 'close', 'check', 'search', 'refresh', 'download', 'upload', 'share'].map((name) => (
                      <Tooltip key={name}>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-muted cursor-default">
                            <Icon name={name} size={24} />
                            <span className="text-xs text-muted-foreground">{name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <code className="text-xs">&lt;Icon name="{name}" /&gt;</code>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-3">Navigation</p>
                  <div className="flex flex-wrap gap-4">
                    {['home', 'menu', 'arrow_back', 'arrow_forward', 'expand_more', 'expand_less', 'chevron_left', 'chevron_right', 'more_vert', 'more_horiz'].map((name) => (
                      <Tooltip key={name}>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-muted cursor-default">
                            <Icon name={name} size={24} />
                            <span className="text-xs text-muted-foreground">{name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <code className="text-xs">&lt;Icon name="{name}" /&gt;</code>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-3">Status & Alerts</p>
                  <div className="flex flex-wrap gap-4">
                    {['info', 'warning', 'error', 'check_circle', 'cancel', 'help', 'notifications', 'report_problem'].map((name) => (
                      <Tooltip key={name}>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-muted cursor-default">
                            <Icon name={name} size={24} />
                            <span className="text-xs text-muted-foreground">{name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <code className="text-xs">&lt;Icon name="{name}" /&gt;</code>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-3">Sizes</p>
                  <div className="flex items-end gap-6">
                    {[16, 20, 24, 32, 48].map((size) => (
                      <div key={size} className="flex flex-col items-center gap-2">
                        <Icon name="star" size={size} />
                        <span className="text-xs text-muted-foreground">{size}px</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-3">With Colors</p>
                  <div className="flex flex-wrap gap-4">
                    <Icon name="favorite" size={24} className="text-destructive" />
                    <Icon name="star" size={24} className="text-warning" />
                    <Icon name="check_circle" size={24} className="text-emerald-500" />
                    <Icon name="info" size={24} className="text-primary" />
                    <Icon name="settings" size={24} className="text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="icon-usage" className="scroll-mt-4">
              <CardHeader>
                <CardTitle className="text-base">Icon Usage</CardTitle>
                <CardDescription>Examples of icons in context</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>
                    <Icon name="add" size={16} className="mr-2" />
                    Add Item
                  </Button>
                  <Button variant="outline">
                    <Icon name="download" size={16} className="mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Icon name="settings" size={20} />
                  </Button>
                  <Button variant="destructive">
                    <Icon name="delete" size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="info" size={16} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Inline icon with text</span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default ComponentsLibraryPage;
