"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["G", "H"], description: "Go to Dashboard (Home)" },
      { keys: ["G", "S"], description: "Go to Scanner" },
      { keys: ["G", "P"], description: "Go to Portfolio" },
      { keys: ["G", "W"], description: "Go to Watchlist" },
      { keys: ["G", "J"], description: "Go to Journal" },
      { keys: ["G", "A"], description: "Go to Alerts" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["/"], description: "Focus search / analyze symbol" },
      { keys: ["N"], description: "New analysis" },
      { keys: ["R"], description: "Refresh data" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
  {
    title: "Lists & Tables",
    shortcuts: [
      { keys: ["J"], description: "Move down" },
      { keys: ["K"], description: "Move up" },
      { keys: ["Enter"], description: "Open selected item" },
      { keys: ["Esc"], description: "Close dialog / deselect" },
    ],
  },
];

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open with ? key (shift + /)
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setIsOpen(true);
        }
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-background border rounded-xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Keyboard className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={i}>
                            <kbd className="px-2 py-1 text-xs bg-muted rounded font-mono">
                              {key}
                            </kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground mx-1">
                                +
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/50 text-center text-sm text-muted-foreground">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">?</kbd>{" "}
          anytime to show this dialog
        </div>
      </div>
    </div>
  );
}

// Hook for navigation shortcuts
export function useKeyboardNavigation() {
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Handle 'g' prefix for navigation
      if (e.key === "g" && !pendingKey) {
        setPendingKey("g");
        return;
      }

      // Handle second key after 'g'
      if (pendingKey === "g") {
        setPendingKey(null);
        switch (e.key.toLowerCase()) {
          case "h":
            window.location.href = "/dashboard";
            break;
          case "s":
            window.location.href = "/scanner";
            break;
          case "p":
            window.location.href = "/portfolio";
            break;
          case "w":
            window.location.href = "/watchlist";
            break;
          case "j":
            window.location.href = "/journal";
            break;
          case "a":
            window.location.href = "/alerts";
            break;
        }
        return;
      }

      // Reset pending key after timeout
      if (pendingKey) {
        setPendingKey(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pendingKey]);

  // Reset pending key after 1 second
  useEffect(() => {
    if (pendingKey) {
      const timeout = setTimeout(() => setPendingKey(null), 1000);
      return () => clearTimeout(timeout);
    }
  }, [pendingKey]);

  return { pendingKey };
}
