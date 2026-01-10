'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Shield,
} from 'lucide-react';

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
    id: 'welcome',
    title: 'Welcome to MCP Finance',
    description: 'AI-powered technical analysis for smarter trading decisions.',
    icon: <Sparkles className="h-12 w-12 text-primary" />,
    features: [
      'Get actionable trade plans with entry, exit, and stop-loss levels',
      'Scan markets for high-probability setups',
      'Track your portfolio risk in real-time',
    ],
  },
  {
    id: 'analyze',
    title: 'Analyze Any Symbol',
    description: 'Enter any stock ticker to get a comprehensive trade plan.',
    icon: <TrendingUp className="h-12 w-12 text-green-500" />,
    features: [
      'Technical indicators analyzed automatically',
      'Risk/reward ratios calculated for you',
      'Position sizing based on your risk tolerance',
    ],
    action: {
      label: 'Try Analyzing AAPL',
      href: '/analyze/AAPL',
    },
  },
  {
    id: 'scanner',
    title: 'Scan for Opportunities',
    description: 'Find trade setups across S&P 500, NASDAQ, and ETFs.',
    icon: <BarChart3 className="h-12 w-12 text-blue-500" />,
    features: [
      'Pre-built scans for different trading styles',
      'Filter by sector, market cap, and more',
      'Ranked by signal strength',
    ],
    action: {
      label: 'Open Scanner',
      href: '/scanner',
    },
  },
  {
    id: 'portfolio',
    title: 'Manage Portfolio Risk',
    description: 'Track your positions and understand your risk exposure.',
    icon: <Briefcase className="h-12 w-12 text-purple-500" />,
    features: [
      'Sector concentration analysis',
      'Maximum drawdown calculation',
      'Hedge suggestions for protection',
    ],
    action: {
      label: 'View Portfolio',
      href: '/portfolio',
    },
  },
  {
    id: 'alerts',
    title: 'Set Price Alerts',
    description: 'Get notified when your targets are hit.',
    icon: <Bell className="h-12 w-12 text-orange-500" />,
    features: [
      'Price target alerts',
      'Technical signal notifications',
      'Email and in-app alerts',
    ],
    action: {
      label: 'Set Up Alerts',
      href: '/alerts',
    },
  },
  {
    id: 'ready',
    title: "You're Ready to Trade!",
    description: 'Start making data-driven trading decisions today.',
    icon: <Target className="h-12 w-12 text-primary" />,
    features: [
      'Press ⌘K anytime to search symbols or navigate',
      'Press ? to see all keyboard shortcuts',
      'Visit Settings to manage your subscription',
    ],
    action: {
      label: 'Go to Dashboard',
      href: '/dashboard',
    },
  },
];

const STORAGE_KEY = 'mcp-finance-onboarding-complete';

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
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
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
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
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
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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
              {isLastStep ? "Let's Go!" : 'Next'}
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
