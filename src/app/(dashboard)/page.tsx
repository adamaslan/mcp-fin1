import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">
          Get started by analyzing a stock, running a scan, or checking your watchlist.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analyze a Stock
            </CardTitle>
            <CardDescription>Get 150+ signals for any ticker</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full gap-2">
              <a href="/analyze/AAPL">
                Start Analysis <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Scan for Trades
            </CardTitle>
            <CardDescription>Find qualified trade setups</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full gap-2">
              <a href="/scanner">
                Start Scan <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learn Signals
            </CardTitle>
            <CardDescription>Understand the signals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full gap-2">
              <a href="/learn/signals">
                View Signals <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting started guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            New to MCP Finance? Here&apos;s how to get the most out of your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1</span>
              <span>
                <strong>Analyze Securities:</strong> Paste any ticker symbol to see technical signals, indicators, and risk assessment.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2</span>
              <span>
                <strong>Scan Universes:</strong> Automatically find stocks matching your criteria across 500+ companies.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3</span>
              <span>
                <strong>Build Watchlists:</strong> Save your favorite stocks and track their signals daily.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4</span>
              <span>
                <strong>Track Portfolio Risk:</strong> (Pro+) Monitor aggregate risk across your positions.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
