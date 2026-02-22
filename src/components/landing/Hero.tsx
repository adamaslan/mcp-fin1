import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  Target,
  ScanLine,
  ShieldAlert,
  Newspaper,
} from "lucide-react";

const TOOL_PREVIEWS = [
  { icon: BarChart3, label: "Analyze" },
  { icon: TrendingUp, label: "Fibonacci" },
  { icon: Target, label: "Trade Plans" },
  { icon: ScanLine, label: "Scanner" },
  { icon: ShieldAlert, label: "Risk" },
  { icon: Newspaper, label: "Briefings" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 sm:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-80 w-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-80 w-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary mb-8">
            <Sparkles className="h-4 w-4" />
            <span>9 Professional Trading Tools on Google Cloud</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
            Your Complete
            <br className="hidden sm:block" />
            Trading Analysis Suite
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Analyze any stock with 150+ signals, find trade setups across 500+
            tickers, manage portfolio risk, and get daily market
            briefings&nbsp;&mdash; all from one platform.
          </p>

          {/* Tool icon strip */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 mb-10">
            {TOOL_PREVIEWS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="p-2.5 rounded-xl bg-muted/60 group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2 text-base px-8">
              <a href="/sign-up">
                Start Free &mdash; 3 Tools Included
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <a href="#tools">Explore All 9 Tools</a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/40">
              <span className="text-2xl font-bold text-foreground">150+</span>
              <span className="text-xs text-muted-foreground">
                Technical Signals
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/40">
              <span className="text-2xl font-bold text-foreground">9</span>
              <span className="text-xs text-muted-foreground">
                Analysis Tools
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/40">
              <span className="text-2xl font-bold text-foreground">500+</span>
              <span className="text-xs text-muted-foreground">
                Stocks Scanned
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/40">
              <span className="text-2xl font-bold text-foreground">
                Real-Time
              </span>
              <span className="text-xs text-muted-foreground">
                Live Market Data
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
