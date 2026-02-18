"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTier } from "@/hooks/useTier";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Zap,
  TrendingUp,
  Settings,
  AlertCircle,
  Download,
  Briefcase,
  Bookmark,
  Sparkles,
  Code,
  Target,
  Scale,
  Activity,
  FlaskConical,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresTier?: "pro" | "max";
  disabled?: boolean;
  external?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { tier } = useTier();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Analyze",
      href: "/dashboard/analyze/AAPL",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      label: "Scanner",
      href: "/dashboard/scanner",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      label: "Watchlist",
      href: "/dashboard/watchlist",
      icon: <Bookmark className="h-5 w-5" />,
    },
    {
      label: "Fibonacci",
      href: "/dashboard/fibonacci",
      icon: <Target className="h-5 w-5" />,
    },
    {
      label: "Options Lab",
      href:
        process.env.NEXT_PUBLIC_OPTIONS_LAB_URL ||
        "http://localhost:8080/dashboard",
      icon: <FlaskConical className="h-5 w-5" />,
      external: true,
    },
    {
      label: "Compare",
      href: "/dashboard/compare",
      icon: <Scale className="h-5 w-5" />,
      requiresTier: "pro",
    },
    {
      label: "Options",
      href: "/dashboard/options",
      icon: <Activity className="h-5 w-5" />,
      requiresTier: "pro",
    },
    {
      label: "Portfolio",
      href: "/dashboard/portfolio",
      icon: <Briefcase className="h-5 w-5" />,
      requiresTier: "pro",
    },
    {
      label: "Alerts",
      href: "/dashboard/alerts",
      icon: <AlertCircle className="h-5 w-5" />,
      requiresTier: "max",
    },
    {
      label: "Export",
      href: "/dashboard/export",
      icon: <Download className="h-5 w-5" />,
      requiresTier: "max",
    },
    {
      label: "Signals",
      href: "/dashboard/signals",
      icon: <Sparkles className="h-5 w-5" />,
      requiresTier: "max",
    },
    {
      label: "API Docs",
      href: "/dashboard/api-docs",
      icon: <Code className="h-5 w-5" />,
      requiresTier: "max",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const canAccess = (item: NavItem) => {
    if (!item.requiresTier) return true;
    if (tier === "max") return true;
    if (item.requiresTier === "pro" && tier === "pro") return true;
    return false;
  };

  return (
    <nav className="w-full flex flex-col p-4 space-y-2">
      <div className="mb-8">
        <h1 className="text-xl font-bold">MCP Finance</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Tier: {tier.toUpperCase()}
        </p>
      </div>

      {navItems.map((item) => {
        const accessible = canAccess(item);

        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.icon}
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-muted-foreground/60">
                &#8599;
              </span>
            </a>
          );
        }

        return (
          <Link
            key={item.href}
            href={accessible ? item.href : "#"}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              !accessible && "opacity-50 cursor-not-allowed",
            )}
            onClick={(e) => !accessible && e.preventDefault()}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.requiresTier && !accessible && (
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                {item.requiresTier.toUpperCase()}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
