"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowUpCircle, WifiOff } from "lucide-react";

interface MCPErrorStateProps {
  /** Error message to display */
  error: string;
  /** Callback to retry the request */
  onRetry?: () => void;
  /** Title for the error card */
  title?: string;
  /** Whether to show a minimal error state */
  minimal?: boolean;
}

/**
 * Determines the error type and returns appropriate icon and styling
 */
function getErrorDetails(error: string): {
  icon: React.ReactNode;
  category: string;
  suggestion: string;
  variant: "default" | "upgrade" | "connection";
} {
  const lowerError = error.toLowerCase();

  if (
    lowerError.includes("upgrade") ||
    lowerError.includes("tier") ||
    lowerError.includes("403")
  ) {
    return {
      icon: <ArrowUpCircle className="h-5 w-5 text-blue-500" />,
      category: "Upgrade Required",
      suggestion: "This feature requires a higher tier subscription.",
      variant: "upgrade",
    };
  }

  if (
    lowerError.includes("unavailable") ||
    lowerError.includes("503") ||
    lowerError.includes("connection") ||
    lowerError.includes("mcp service")
  ) {
    return {
      icon: <WifiOff className="h-5 w-5 text-orange-500" />,
      category: "Service Unavailable",
      suggestion:
        "The MCP backend server may be offline. Please try again later.",
      variant: "connection",
    };
  }

  if (lowerError.includes("rate limit") || lowerError.includes("429")) {
    return {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      category: "Rate Limit Exceeded",
      suggestion: "You've reached your daily limit. Upgrade for more requests.",
      variant: "default",
    };
  }

  if (lowerError.includes("auth") || lowerError.includes("401")) {
    return {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      category: "Authentication Required",
      suggestion: "Please sign in to continue.",
      variant: "default",
    };
  }

  return {
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    category: "Error",
    suggestion: "An unexpected error occurred. Please try again.",
    variant: "default",
  };
}

/**
 * Consistent error state for MCP tool pages.
 * Handles different error types with appropriate messaging.
 */
export function MCPErrorState({
  error,
  onRetry,
  title,
  minimal = false,
}: MCPErrorStateProps) {
  const { icon, category, suggestion, variant } = getErrorDetails(error);

  const bgColor = {
    default: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900",
    upgrade:
      "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900",
    connection:
      "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900",
  }[variant];

  if (minimal) {
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border ${bgColor}`}
      >
        {icon}
        <div className="flex-1">
          <p className="text-sm font-medium">{error}</p>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`border ${bgColor}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-white dark:bg-gray-900 shadow-sm">
            {icon}
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold">{title || category}</h3>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          </div>

          <p className="text-xs text-muted-foreground">{suggestion}</p>

          <div className="flex gap-3">
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}

            {variant === "upgrade" && (
              <Button asChild>
                <a href="/pricing">View Plans</a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline error message for use within components
 */
export function MCPInlineError({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm">{error}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={onRetry}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
