"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "free" | "pro" | "max";
}

interface ToolSelectorProps {
  tools: Tool[];
  selectedTool: string;
  onSelectTool: (toolId: string) => void;
  tier?: string;
}

export function ToolSelector({
  tools,
  selectedTool,
  onSelectTool,
  tier = "free",
}: ToolSelectorProps) {
  const canAccessTool = (toolTier: string) => {
    if (toolTier === "free") return true;
    if (toolTier === "pro") return tier === "pro" || tier === "max";
    if (toolTier === "max") return tier === "max";
    return false;
  };

  const availableTools = tools.filter((t) => canAccessTool(t.tier));
  const lockedTools = tools.filter((t) => !canAccessTool(t.tier));

  return (
    <div className="space-y-3">
      {/* Available Tools Dropdown */}
      <Select value={selectedTool} onValueChange={onSelectTool}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a tool..." />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Available Tools
          </div>
          {availableTools.map((tool) => (
            <SelectItem key={tool.id} value={tool.id}>
              <span className="flex items-center gap-2">
                <span>{tool.icon}</span>
                <span>{tool.name}</span>
              </span>
            </SelectItem>
          ))}

          {lockedTools.length > 0 && (
            <>
              <div className="my-2 px-2 h-px bg-border" />
              <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Locked (Upgrade)
              </div>
              {lockedTools.map((tool) => (
                <SelectItem
                  key={tool.id}
                  value={tool.id}
                  disabled
                  className="opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>{tool.name}</span>
                  </span>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>

      {/* Tools Grid (for quick access) */}
      <div className="grid grid-cols-2 gap-2">
        {tools.slice(0, 4).map((tool) => {
          const isAccessible = canAccessTool(tool.tier);
          const isSelected = selectedTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => isAccessible && onSelectTool(tool.id)}
              disabled={!isAccessible}
              className={`p-2 rounded-lg border transition-colors text-left text-xs ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : isAccessible
                    ? "border-border hover:border-primary/50 hover:bg-accent"
                    : "border-border opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="font-semibold">{tool.icon}</div>
              <div className="font-medium truncate text-xs mt-1 line-clamp-2">
                {tool.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tier Info */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <div className="flex justify-between">
          <span>Available:</span>
          <Badge variant="outline" className="ml-auto">
            {availableTools.length}/{tools.length}
          </Badge>
        </div>
        {lockedTools.length > 0 && tier === "free" && (
          <p className="text-warning-foreground">
            Upgrade to Pro to unlock {lockedTools.length} more tools
          </p>
        )}
      </div>
    </div>
  );
}
