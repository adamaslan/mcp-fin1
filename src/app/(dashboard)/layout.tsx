"use client";

import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { CommandPalette } from "@/components/ui/command-palette";
import {
  KeyboardShortcutsDialog,
  useKeyboardNavigation,
} from "@/components/ui/keyboard-shortcuts";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enable keyboard navigation shortcuts
  useKeyboardNavigation();

  return (
    <div className="flex h-screen">
      {/* Global Components */}
      <CommandPalette />
      <KeyboardShortcutsDialog />
      <OnboardingFlow />

      {/* Sidebar */}
      <div className="hidden md:flex w-64 border-r bg-muted/40">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Header />
            <div className="flex items-center gap-4">
              {/* Keyboard shortcut hint */}
              <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
                <span>Search</span>
              </div>
              <ClerkLoading>
                <Skeleton className="h-10 w-10 rounded-full" />
              </ClerkLoading>
              <ClerkLoaded>
                <UserButton afterSignOutUrl="/" />
              </ClerkLoaded>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
