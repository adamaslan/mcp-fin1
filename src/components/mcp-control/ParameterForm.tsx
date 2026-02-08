"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TierGate } from "@/components/gating/TierGate";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Tool-specific parameter definitions for all 9 MCP tools
 * Each tool has its own required/optional parameters with validation rules
 */
const TOOL_PARAMETERS: Record<string, ParameterDef[]> = {
  analyze_security: [
    {
      name: "symbol",
      type: "text",
      required: true,
      label: "Symbol",
      placeholder: "e.g., AAPL, SPY",
      help: "Stock ticker symbol",
    },
    {
      name: "period",
      type: "select",
      required: false,
      label: "Period",
      default: "1mo",
      options: ["1mo", "3mo", "6mo", "1y"],
      help: "Time period for analysis",
    },
    {
      name: "use_ai",
      type: "boolean",
      required: false,
      label: "AI Analysis",
      requiredTier: "pro",
      help: "Include Gemini AI insights",
    },
  ],

  analyze_fibonacci: [
    {
      name: "symbol",
      type: "text",
      required: true,
      label: "Symbol",
      placeholder: "e.g., AAPL",
      help: "Stock ticker symbol",
    },
    {
      name: "period",
      type: "select",
      required: false,
      label: "Period",
      default: "1mo",
      options: ["1d", "1mo", "3mo", "6mo", "1y"],
      help: "Time period for swing detection",
    },
    {
      name: "window",
      type: "number",
      required: false,
      label: "Window Size",
      default: 150,
      min: 50,
      max: 200,
      help: "Lookback window for swing detection (50-200)",
    },
  ],

  get_trade_plan: [
    {
      name: "symbol",
      type: "text",
      required: true,
      label: "Symbol",
      placeholder: "e.g., AAPL",
      help: "Stock ticker symbol",
    },
    {
      name: "period",
      type: "select",
      required: false,
      label: "Period",
      default: "1mo",
      options: ["1d", "1mo", "3mo", "6mo"],
      help: "Time period for trade plan",
    },
  ],

  compare_securities: [
    {
      name: "symbols",
      type: "text-array",
      required: true,
      label: "Symbols",
      placeholder: "AAPL, MSFT, GOOGL",
      help: "Comma-separated list of symbols (min 2, max 20)",
    },
    {
      name: "period",
      type: "select",
      required: false,
      label: "Period",
      default: "1mo",
      options: ["1mo", "3mo", "6mo", "1y"],
      help: "Period for comparison",
    },
  ],

  screen_securities: [
    {
      name: "universe",
      type: "select",
      required: false,
      label: "Universe",
      default: "sp500",
      options: ["sp500", "nasdaq100", "etf_large_cap"],
      help: "Stock universe to screen",
    },
    {
      name: "min_score",
      type: "number",
      required: false,
      label: "Min Score",
      default: 50,
      min: 0,
      max: 100,
      help: "Minimum signal score threshold",
    },
    {
      name: "limit",
      type: "number",
      required: false,
      label: "Results Limit",
      default: 20,
      min: 1,
      max: 100,
      help: "Maximum results to return",
    },
  ],

  scan_trades: [
    {
      name: "universe",
      type: "select",
      required: false,
      label: "Universe",
      default: "sp500",
      options: ["sp500", "nasdaq100", "etf_large_cap", "crypto"],
      help: "Universe to scan for trades",
    },
    {
      name: "maxResults",
      type: "number",
      required: false,
      label: "Max Results",
      default: 10,
      min: 1,
      max: 50,
      help: "Maximum trade setups to return",
    },
  ],

  portfolio_risk: [
    {
      name: "positions",
      type: "json",
      required: true,
      label: "Positions (JSON)",
      placeholder: '[{"symbol":"AAPL","shares":100,"entry_price":150}]',
      help: "Array of positions: {symbol, shares, entry_price}",
    },
  ],

  morning_brief: [
    {
      name: "watchlist",
      type: "text-array",
      required: false,
      label: "Watchlist Symbols",
      placeholder: "AAPL, MSFT, SPY",
      help: "Symbols to include in brief (optional)",
    },
    {
      name: "marketRegion",
      type: "select",
      required: false,
      label: "Market Region",
      default: "US",
      options: ["US", "EU", "ASIA"],
      help: "Primary market region",
    },
  ],

  options_risk_analysis: [
    {
      name: "symbol",
      type: "text",
      required: true,
      label: "Symbol",
      placeholder: "e.g., AAPL",
      help: "Stock ticker symbol",
    },
    {
      name: "optionType",
      type: "select",
      required: false,
      label: "Option Type",
      default: "both",
      options: ["calls", "puts", "both"],
      help: "Which options to analyze",
    },
    {
      name: "min_volume",
      type: "number",
      required: false,
      label: "Min Volume",
      default: 10,
      min: 1,
      max: 1000,
      help: "Minimum volume threshold for liquidity",
    },
  ],
};

interface ParameterDef {
  name: string;
  type: "text" | "number" | "select" | "boolean" | "text-array" | "json";
  required: boolean;
  label: string;
  placeholder?: string;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  requiredTier?: "pro" | "max";
  help?: string;
}

interface ParameterFormProps {
  toolName: string;
  parameters: Record<string, any>;
  onChange: (params: Record<string, any>) => void;
  tier?: string;
}

export function ParameterForm({
  toolName,
  parameters,
  onChange,
  tier = "free",
}: ParameterFormProps) {
  const toolParams = TOOL_PARAMETERS[toolName] || [];

  const handleChange = (name: string, value: any) => {
    onChange({ ...parameters, [name]: value });
  };

  return (
    <div className="space-y-4">
      {toolParams.length === 0 ? (
        <p className="text-sm text-muted-foreground">No parameters available</p>
      ) : (
        toolParams.map((param) => (
          <div key={param.name}>
            {param.requiredTier ? (
              <TierGate
                feature={param.name}
                requiredTier={param.requiredTier}
                blurContent={false}
              >
                <ParameterInput
                  param={param}
                  value={parameters[param.name]}
                  onChange={handleChange}
                />
              </TierGate>
            ) : (
              <ParameterInput
                param={param}
                value={parameters[param.name]}
                onChange={handleChange}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}

interface ParameterInputProps {
  param: ParameterDef;
  value: any;
  onChange: (name: string, value: any) => void;
}

function ParameterInput({ param, value, onChange }: ParameterInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={param.name} className="text-sm font-medium">
          {param.label}
          {param.required && <span className="text-destructive">*</span>}
        </Label>
        {param.help && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                {param.help}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Text Input */}
      {param.type === "text" && (
        <Input
          id={param.name}
          type="text"
          value={value || ""}
          onChange={(e) => onChange(param.name, e.target.value)}
          placeholder={param.placeholder}
          className="text-sm"
        />
      )}

      {/* Number Input */}
      {param.type === "number" && (
        <Input
          id={param.name}
          type="number"
          value={value ?? (param.default || "")}
          onChange={(e) =>
            onChange(param.name, e.target.value ? Number(e.target.value) : null)
          }
          min={param.min}
          max={param.max}
          className="text-sm"
        />
      )}

      {/* Select Dropdown */}
      {param.type === "select" && param.options && (
        <Select
          value={value || param.default || ""}
          onValueChange={(val) => onChange(param.name, val)}
        >
          <SelectTrigger id={param.name} className="text-sm">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {param.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Boolean Toggle */}
      {param.type === "boolean" && (
        <div className="flex items-center space-x-2 pt-1">
          <Switch
            id={param.name}
            checked={value || false}
            onCheckedChange={(checked) => onChange(param.name, checked)}
          />
          <Label
            htmlFor={param.name}
            className="text-sm font-normal cursor-pointer"
          >
            {value ? "Enabled" : "Disabled"}
          </Label>
        </div>
      )}

      {/* Text Array (comma-separated) */}
      {param.type === "text-array" && (
        <div className="space-y-1">
          <Input
            id={param.name}
            type="text"
            value={Array.isArray(value) ? value.join(", ") : value || ""}
            onChange={(e) => {
              const symbols = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              onChange(param.name, symbols);
            }}
            placeholder={param.placeholder}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {Array.isArray(value) && value.length > 0
              ? `${value.length} symbol(s) selected`
              : "Comma-separated values"}
          </p>
        </div>
      )}

      {/* JSON Input */}
      {param.type === "json" && (
        <div className="space-y-1">
          <textarea
            id={param.name}
            value={
              typeof value === "string"
                ? value
                : JSON.stringify(value || [], null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(param.name, parsed);
              } catch {
                onChange(param.name, e.target.value);
              }
            }}
            placeholder={param.placeholder}
            className="text-sm font-mono p-2 border rounded-md resize-none w-full h-24 bg-background"
          />
          <p className="text-xs text-muted-foreground">Valid JSON required</p>
        </div>
      )}
    </div>
  );
}
