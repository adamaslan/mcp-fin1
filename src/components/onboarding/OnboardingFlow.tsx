"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Target,
  CheckCircle2,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  action?: {
    label: string;
    href: string;
  };
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to MCP Finance",
    description:
      "9 professional analysis tools powered by real market data — built for traders who refuse to guess.",
    icon: <Sparkles className="h-12 w-12 text-primary" />,
    features: [
      "3 free tools: Analyze Security, Fibonacci Analysis, Trade Plan",
      "6 Pro tools: Compare, Screen, Scan, Portfolio Risk, Morning Brief, Options Risk",
      "Every result comes from live data — no mock data, ever",
    ],
  },
  {
    id: "analyze",
    title: "Analyze, Fibonacci & Trade Plan",
    description:
      "Your three free tools — each giving you a different angle on any stock.",
    icon: <TrendingUp className="h-12 w-12 text-green-500" />,
    features: [
      "Analyze Security: 150+ signals scored, volatility regime, support/resistance",
      "Fibonacci Analysis: 40+ levels, golden pocket, multi-timeframe confluences",
      "Trade Plan: exact entry, stop-loss, and profit target with risk/reward ratio",
    ],
    action: {
      label: "Analyze AAPL Now",
      href: "/analyze/AAPL",
    },
  },
  {
    id: "scanner",
    title: "Compare, Screen & Scan Trades",
    description:
      "Three Pro tools that help you find the best setups across the whole market.",
    icon: <BarChart3 className="h-12 w-12 text-blue-500" />,
    features: [
      "Compare Securities: head-to-head signal strength and relative ranking",
      "Screen Securities: filter 500+ stocks by trend, momentum, and signal score",
      "Scan Trades: auto-ranked setups with entry/stop/target already calculated",
    ],
    action: {
      label: "Open Scanner",
      href: "/scanner",
    },
  },
  {
    id: "portfolio",
    title: "Portfolio Risk Engine",
    description:
      "Know exactly how much you can lose before a single stop is hit.",
    icon: <Briefcase className="h-12 w-12 text-purple-500" />,
    features: [
      "ATR-based stop levels calculated per position — not guesswork",
      "Total max-loss in dollars if every stop hits simultaneously",
      "Sector concentration breakdown with overweight detection",
      "Hedge suggestions when you're overexposed (Max tier)",
    ],
    action: {
      label: "View Portfolio Risk",
      href: "/portfolio",
    },
  },
  {
    id: "intelligence",
    title: "Morning Brief & Options Risk",
    description:
      "Two Pro tools for market intelligence before you place a trade.",
    icon: <Bell className="h-12 w-12 text-orange-500" />,
    features: [
      "Morning Brief: pre-market sentiment, sector rotation, key catalysts daily",
      "Options Risk Analysis: implied volatility, put/call ratio, Greeks-based metrics",
      "Both tools pull live data — no delayed or synthetic results",
    ],
    action: {
      label: "See Pro Tools",
      href: "#pricing",
    },
  },
  {
    id: "ready",
    title: "You're Ready to Trade!",
    description: "Start with the 3 free tools — upgrade when you need more.",
    icon: <Target className="h-12 w-12 text-primary" />,
    features: [
      "Press ⌘K anytime to search symbols or navigate",
      "Free: Analyze Security, Fibonacci Analysis, Trade Plan",
      "Visit Settings to manage your subscription and tier",
    ],
    action: {
      label: "Go to Dashboard",
      href: "/dashboard",
    },
  },
];

const STORAGE_KEY = "mcp-finance-onboarding-complete";

export function OnboardingFlow() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if onboarding is complete
    const isComplete = localStorage.getItem(STORAGE_KEY);
    if (!isComplete && user) {
      // Delay opening to not interfere with initial page load
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <Card className="relative w-full max-w-lg overflow-hidden">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Skip onboarding"
        >
          <X className="h-5 w-5" />
        </button>

        <CardContent className="p-8">
          {/* Progress */}
          <div className="flex gap-1 mb-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">{step.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {step.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </div>

            <Button onClick={handleNext} className="gap-1">
              {isLastStep ? "Let's Go!" : "Next"}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reset function for testing
export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
}
