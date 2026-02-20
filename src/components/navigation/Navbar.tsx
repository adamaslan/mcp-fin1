"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const MCP_TOOLS = [
  { id: "analyze-security", name: "Analyze Security" },
  { id: "fibonacci", name: "Fibonacci Analysis" },
  { id: "trade-plan", name: "Trade Plan" },
  { id: "compare", name: "Compare Securities" },
  { id: "screen", name: "Screen Securities" },
  { id: "scanner", name: "Scan Trades" },
  { id: "portfolio", name: "Portfolio Risk" },
  { id: "morning-brief", name: "Morning Brief" },
  { id: "options", name: "Options Risk" },
];

export function Navbar() {
  return (
    <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          MCP Finance
        </Link>

        <nav className="hidden md:flex gap-8 items-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>

          {/* Tools dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Tools
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {MCP_TOOLS.map((tool) => (
                <DropdownMenuItem key={tool.id} asChild>
                  <Link href={`/tools/${tool.id}`} className="cursor-pointer">
                    {tool.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedOut>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </SignedOut>
          <SignedIn>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
