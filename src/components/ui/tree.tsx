import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent } from "./collapsible";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  label: string;
  badgeText?: string;
  children?: TreeNode[];
  matched?: boolean;
  active?: boolean;
  statusText?: string;
  statusColor?: string;
}

interface TreeProps {
  nodes: TreeNode[];
  isCollapsed: (id: string) => boolean;
  onToggle: (id: string) => void;
  onNodeClick?: (node: TreeNode, hasChildren: boolean) => void;
  onNodeMouseEnter?: (node: TreeNode) => void;
  onNodeMouseLeave?: (node: TreeNode) => void;
  className?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  depth: number;
  isCollapsed: (id: string) => boolean;
  onToggle: (id: string) => void;
  onNodeClick?: (node: TreeNode, hasChildren: boolean) => void;
  onNodeMouseEnter?: (node: TreeNode) => void;
  onNodeMouseLeave?: (node: TreeNode) => void;
}

function TreeNodeItem({
  node,
  depth,
  isCollapsed,
  onToggle,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
}: TreeNodeItemProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const open = hasChildren ? !isCollapsed(node.id) : false;

  if (!hasChildren) {
    return (
      <li>
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
            node.active ? "bg-slate-800" : "hover:bg-slate-800/70",
            node.matched ? "text-slate-100" : "text-slate-500",
          )}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onMouseEnter={() => onNodeMouseEnter?.(node)}
          onMouseLeave={() => onNodeMouseLeave?.(node)}
          onClick={() => onNodeClick?.(node, false)}
          role="treeitem"
        >
          <span className="w-3 shrink-0 text-[10px] text-slate-500">•</span>
          {node.badgeText ? (
            <span className="shrink-0 rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
              {node.badgeText}
            </span>
          ) : null}
          <span className={cn("truncate text-xs font-medium", !node.matched && "text-slate-500")}>
            {node.label}
          </span>
          {node.statusText ? (
        <span className="ml-auto inline-flex items-center">
          <span
            className="h-2.5 w-2.5 rounded-full border border-slate-900/70 shadow-sm"
            style={{ backgroundColor: node.statusColor }}
            aria-label={node.statusText}
            title={node.statusText}
          />
        </span>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li>
      <Collapsible open={open}>
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
            node.active ? "bg-slate-800" : "hover:bg-slate-800/70",
            node.matched ? "text-slate-100" : "text-slate-500",
          )}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onMouseEnter={() => onNodeMouseEnter?.(node)}
          onMouseLeave={() => onNodeMouseLeave?.(node)}
          onClick={() => onNodeClick?.(node, true)}
          role="treeitem"
          aria-expanded={open}
        >
          <button
            type="button"
            aria-label={open ? "Collapse node" : "Expand node"}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-slate-500 hover:bg-slate-700/60"
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} />
          </button>
          {node.badgeText ? (
            <span className="shrink-0 rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
              {node.badgeText}
            </span>
          ) : null}
          <span className={cn("truncate text-xs font-medium", !node.matched && "text-slate-500")}>
            {node.label}
          </span>
          {node.statusText ? (
            <span className="ml-auto inline-flex items-center">
              <span
                className="h-2.5 w-2.5 rounded-full border border-slate-900/70 shadow-sm"
                style={{ backgroundColor: node.statusColor }}
                aria-label={node.statusText}
                title={node.statusText}
              />
            </span>
          ) : null}
        </div>
        <CollapsibleContent>
          <ul role="group" className="space-y-0.5">
            {node.children!.map((child) => (
              <TreeNodeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                isCollapsed={isCollapsed}
                onToggle={onToggle}
                onNodeClick={onNodeClick}
                onNodeMouseEnter={onNodeMouseEnter}
                onNodeMouseLeave={onNodeMouseLeave}
              />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

export function Tree({
  nodes,
  isCollapsed,
  onToggle,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  className,
}: TreeProps) {
  return (
    <ul role="tree" className={cn("space-y-0.5", className)}>
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          depth={0}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
        />
      ))}
    </ul>
  );
}
