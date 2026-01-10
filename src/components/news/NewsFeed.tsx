'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Sentiment = 'bullish' | 'bearish' | 'neutral';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  symbols: string[];
  sentiment?: Sentiment;
  imageUrl?: string;
}

// Mock data - in production, fetch from news API
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Apple Reports Record Q4 Revenue Driven by iPhone 16 Sales',
    summary:
      'Apple Inc. announced quarterly revenue of $123.9 billion, up 8% year over year, with strong iPhone and Services growth...',
    source: 'Reuters',
    url: '#',
    publishedAt: '2 hours ago',
    symbols: ['AAPL'],
    sentiment: 'bullish',
  },
  {
    id: '2',
    title: 'Fed Officials Signal Patience on Rate Cuts Amid Inflation Concerns',
    summary:
      'Federal Reserve officials indicated they are in no rush to cut interest rates, citing persistent inflation pressures...',
    source: 'Bloomberg',
    url: '#',
    publishedAt: '3 hours ago',
    symbols: ['SPY', 'QQQ'],
    sentiment: 'bearish',
  },
  {
    id: '3',
    title: 'NVIDIA Unveils Next-Gen AI Chips at CES 2026',
    summary:
      'NVIDIA announced its latest Blackwell Ultra architecture, promising 3x performance improvement for AI workloads...',
    source: 'CNBC',
    url: '#',
    publishedAt: '5 hours ago',
    symbols: ['NVDA', 'AMD'],
    sentiment: 'bullish',
  },
  {
    id: '4',
    title: 'Tesla Deliveries Miss Estimates as Competition Intensifies',
    summary:
      'Tesla reported Q4 deliveries of 484,507 vehicles, below analyst expectations of 490,000, as Chinese rivals gain market share...',
    source: 'Wall Street Journal',
    url: '#',
    publishedAt: '6 hours ago',
    symbols: ['TSLA'],
    sentiment: 'bearish',
  },
  {
    id: '5',
    title: 'Microsoft Cloud Revenue Beats Estimates on AI Demand',
    summary:
      'Microsoft Azure revenue grew 29% year-over-year, exceeding expectations as enterprise AI adoption accelerates...',
    source: 'Financial Times',
    url: '#',
    publishedAt: '8 hours ago',
    symbols: ['MSFT'],
    sentiment: 'bullish',
  },
  {
    id: '6',
    title: 'Oil Prices Stabilize as OPEC+ Maintains Production Cuts',
    summary:
      'Crude oil prices held steady around $75/barrel after OPEC+ confirmed it will maintain current production levels through Q1...',
    source: 'Reuters',
    url: '#',
    publishedAt: '10 hours ago',
    symbols: ['XLE', 'USO'],
    sentiment: 'neutral',
  },
];

const SENTIMENT_CONFIG: Record<Sentiment, { icon: React.ReactNode; color: string; label: string }> =
  {
    bullish: { icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-500', label: 'Bullish' },
    bearish: {
      icon: <TrendingDown className="h-4 w-4" />,
      color: 'text-red-500',
      label: 'Bearish',
    },
    neutral: { icon: <Minus className="h-4 w-4" />, color: 'text-gray-500', label: 'Neutral' },
  };

interface NewsFeedProps {
  symbols?: string[];
  limit?: number;
}

export function NewsFeed({ symbols, limit = 10 }: NewsFeedProps) {
  // Filter by symbols if provided
  const filteredNews = symbols
    ? MOCK_NEWS.filter((news) => news.symbols.some((s) => symbols.includes(s)))
    : MOCK_NEWS;

  const displayNews = filteredNews.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Market News
        </CardTitle>
        <CardDescription>
          {symbols ? `News for ${symbols.join(', ')}` : 'Latest market-moving news'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayNews.map((news) => (
            <article
              key={news.id}
              className="group p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary transition-colors line-clamp-2 group-hover:underline"
                  >
                    {news.title}
                  </a>

                  {/* Summary */}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{news.summary}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* Source and time */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{news.source}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{news.publishedAt}</span>
                    </div>

                    {/* Symbols */}
                    <div className="flex items-center gap-1">
                      {news.symbols.map((symbol) => (
                        <a key={symbol} href={`/analyze/${symbol}`}>
                          <Badge variant="secondary" className="text-xs hover:bg-primary/20">
                            {symbol}
                          </Badge>
                        </a>
                      ))}
                    </div>

                    {/* Sentiment */}
                    {news.sentiment && (
                      <div
                        className={`flex items-center gap-1 ${
                          SENTIMENT_CONFIG[news.sentiment].color
                        }`}
                      >
                        {SENTIMENT_CONFIG[news.sentiment].icon}
                        <span className="text-xs">{SENTIMENT_CONFIG[news.sentiment].label}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* External link */}
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Read full article: ${news.title}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}

          {displayNews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No news available for the selected symbols.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
