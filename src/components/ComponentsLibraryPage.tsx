import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Toggle } from './ui/toggle';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Kbd, KbdGroup } from './ui/kbd';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty';
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

function ComponentsLibraryPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sliderVal, setSliderVal] = useState([50]);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>shadcn/ui Component Library</CardTitle>
            <CardDescription>
              All components added via <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">npm run shadcn -- add --all</code>. TheSans C4 typeface.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Accordion */}
        <Card>
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
            <CardDescription>Collapsible sections</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="1">
                <AccordionTrigger>Section 1</AccordionTrigger>
                <AccordionContent>Content for section 1.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger>Section 2</AccordionTrigger>
                <AccordionContent>Content for section 2.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Alert */}
        <Card>
          <CardHeader>
            <CardTitle>Alert</CardTitle>
            <CardDescription>Default and destructive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>Default</AlertTitle>
              <AlertDescription>This is the default alert style.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Destructive</AlertTitle>
              <AlertDescription>This is the destructive alert style.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Alert Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Dialog</CardTitle>
            <CardDescription>Confirmation dialog</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Open</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Aspect Ratio */}
        <Card>
          <CardHeader>
            <CardTitle>Aspect Ratio</CardTitle>
            <CardDescription>16/9 container</CardDescription>
          </CardHeader>
          <CardContent>
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-md" />
          </CardContent>
        </Card>

        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>With fallback</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Avatar>
              <AvatarImage src="" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        {/* Badge */}
        <Card>
          <CardHeader>
            <CardTitle>Badge</CardTitle>
            <CardDescription>Variants</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </CardContent>
        </Card>

        {/* Breadcrumb */}
        <Card>
          <CardHeader>
            <CardTitle>Breadcrumb</CardTitle>
            <CardDescription>Navigation path</CardDescription>
          </CardHeader>
          <CardContent>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Library</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>

        {/* Button & Button Group */}
        <Card>
          <CardHeader>
            <CardTitle>Button & Button Group</CardTitle>
            <CardDescription>Variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
            <ButtonGroup>
              <Button variant="outline">Left</Button>
              <Button variant="outline">Center</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Date picker</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" className="rounded-md border" />
          </CardContent>
        </Card>

        {/* Checkbox */}
        <Card>
          <CardHeader>
            <CardTitle>Checkbox</CardTitle>
            <CardDescription>With label</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Checkbox id="cb1" />
            <Label htmlFor="cb1">Accept terms</Label>
          </CardContent>
        </Card>

        {/* Collapsible */}
        <Card>
          <CardHeader>
            <CardTitle>Collapsible</CardTitle>
            <CardDescription>Toggle content</CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Toggle <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-sm text-muted-foreground">Hidden content shown when expanded.</p>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
            <CardDescription>Modal dialog</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog title</DialogTitle>
                  <DialogDescription>Dialog description.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Dropdown Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu</CardTitle>
            <CardDescription>Context actions</CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Copy</DropdownMenuItem>
                <DropdownMenuItem>Paste</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Empty */}
        <Card>
          <CardHeader>
            <CardTitle>Empty</CardTitle>
            <CardDescription>Empty state</CardDescription>
          </CardHeader>
          <CardContent>
            <Empty>
              <EmptyMedia />
              <EmptyHeader>
                <EmptyTitle>No items</EmptyTitle>
                <EmptyDescription>Add something to get started.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>

        {/* Hover Card */}
        <Card>
          <CardHeader>
            <CardTitle>Hover Card</CardTitle>
            <CardDescription>Hover to reveal</CardDescription>
          </CardHeader>
          <CardContent>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">Hover me</Button>
              </HoverCardTrigger>
              <HoverCardContent>Hover card content.</HoverCardContent>
            </HoverCard>
          </CardContent>
        </Card>

        {/* Input & Label & Textarea */}
        <Card>
          <CardHeader>
            <CardTitle>Input, Label, Textarea</CardTitle>
            <CardDescription>Form primitives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-demo">Label</Label>
              <Input id="input-demo" placeholder="Placeholder" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textarea-demo">Textarea</Label>
              <Textarea id="textarea-demo" placeholder="Placeholder" rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Kbd */}
        <Card>
          <CardHeader>
            <CardTitle>Kbd</CardTitle>
            <CardDescription>Keyboard shortcut</CardDescription>
          </CardHeader>
          <CardContent>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </CardContent>
        </Card>

        {/* Pagination */}
        <Card>
          <CardHeader>
            <CardTitle>Pagination</CardTitle>
            <CardDescription>Page navigation</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Popover */}
        <Card>
          <CardHeader>
            <CardTitle>Popover</CardTitle>
            <CardDescription>Floating content</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent>Popover content.</PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Progress bar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={60} />
          </CardContent>
        </Card>

        {/* Radio Group */}
        <Card>
          <CardHeader>
            <CardTitle>Radio Group</CardTitle>
            <CardDescription>Single choice</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue="a" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="a" id="r1" />
                <Label htmlFor="r1">Option A</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="b" id="r2" />
                <Label htmlFor="r2">Option B</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Scroll Area */}
        <Card>
          <CardHeader>
            <CardTitle>Scroll Area</CardTitle>
            <CardDescription>Scrollable region</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-24 w-full rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Scrollable content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Select */}
        <Card>
          <CardHeader>
            <CardTitle>Select</CardTitle>
            <CardDescription>Dropdown select</CardDescription>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Option 1</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Separator */}
        <Card>
          <CardHeader>
            <CardTitle>Separator</CardTitle>
            <CardDescription>Visual divider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">Above</p>
              <Separator />
              <p className="text-sm">Below</p>
            </div>
          </CardContent>
        </Card>

        {/* Sheet */}
        <Card>
          <CardHeader>
            <CardTitle>Sheet</CardTitle>
            <CardDescription>Slide-out panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">Open sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet title</SheetTitle>
                  <SheetDescription>Sheet description.</SheetDescription>
                </SheetHeader>
                <p className="py-4 text-sm text-muted-foreground">Content.</p>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        {/* Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton</CardTitle>
            <CardDescription>Loading placeholder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>

        {/* Slider */}
        <Card>
          <CardHeader>
            <CardTitle>Slider</CardTitle>
            <CardDescription>Range input</CardDescription>
          </CardHeader>
          <CardContent>
            <Slider value={sliderVal} onValueChange={setSliderVal} max={100} step={1} className="w-full" />
            <p className="text-sm text-muted-foreground">Value: {sliderVal[0]}</p>
          </CardContent>
        </Card>

        {/* Sonner (toast) */}
        <Card>
          <CardHeader>
            <CardTitle>Toast (Sonner)</CardTitle>
            <CardDescription>Trigger a toast</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.success('Toast message')}>Show toast</Button>
          </CardContent>
        </Card>

        {/* Spinner */}
        <Card>
          <CardHeader>
            <CardTitle>Spinner</CardTitle>
            <CardDescription>Loading indicator</CardDescription>
          </CardHeader>
          <CardContent>
            <Spinner className="h-8 w-8" />
          </CardContent>
        </Card>

        {/* Switch */}
        <Card>
          <CardHeader>
            <CardTitle>Switch</CardTitle>
            <CardDescription>Toggle</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Switch id="sw1" />
            <Label htmlFor="sw1">Enable</Label>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
            <CardDescription>Data table</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>A</TableCell>
                  <TableCell>1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>B</TableCell>
                  <TableCell>2</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Tabbed content</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="one" className="w-full">
              <TabsList>
                <TabsTrigger value="one">One</TabsTrigger>
                <TabsTrigger value="two">Two</TabsTrigger>
              </TabsList>
              <TabsContent value="one">Content one.</TabsContent>
              <TabsContent value="two">Content two.</TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Toggle & Toggle Group */}
        <Card>
          <CardHeader>
            <CardTitle>Toggle & Toggle Group</CardTitle>
            <CardDescription>Toggle buttons</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Toggle>Toggle</Toggle>
            <ToggleGroup type="single">
              <ToggleGroupItem value="a">A</ToggleGroupItem>
              <ToggleGroupItem value="b">B</ToggleGroupItem>
              <ToggleGroupItem value="c">C</ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>

        {/* Tooltip */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltip</CardTitle>
            <CardDescription>Hover tooltip</CardDescription>
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover for tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip text</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export default ComponentsLibraryPage;
