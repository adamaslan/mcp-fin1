'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingUp,
  BarChart3,
  Briefcase,
  BookOpen,
  Bell,
  Settings,
  Home,
  Scan,
  FileText,
  Download,
  X,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  category: 'navigation' | 'symbol' | 'action';
}

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq-100 ETF' },
  { symbol: 'IWM', name: 'Russell 2000 ETF' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigationItems: CommandItem[] = [
    {
      id: 'home',
      title: 'Dashboard',
      subtitle: 'Go to main dashboard',
      icon: <Home className="h-4 w-4" />,
      action: () => router.push('/dashboard'),
      keywords: ['home', 'main'],
      category: 'navigation',
    },
    {
      id: 'scanner',
      title: 'Scanner',
      subtitle: 'Scan for trade opportunities',
      icon: <Scan className="h-4 w-4" />,
      action: () => router.push('/scanner'),
      keywords: ['scan', 'find', 'search', 'opportunities'],
      category: 'navigation',
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      subtitle: 'View portfolio risk analysis',
      icon: <Briefcase className="h-4 w-4" />,
      action: () => router.push('/portfolio'),
      keywords: ['positions', 'holdings', 'risk'],
      category: 'navigation',
    },
    {
      id: 'watchlist',
      title: 'Watchlist',
      subtitle: 'Manage your watchlists',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push('/watchlist'),
      keywords: ['watch', 'track', 'symbols'],
      category: 'navigation',
    },
    {
      id: 'journal',
      title: 'Trade Journal',
      subtitle: 'Review your trade history',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => router.push('/journal'),
      keywords: ['trades', 'history', 'log'],
      category: 'navigation',
    },
    {
      id: 'alerts',
      title: 'Alerts',
      subtitle: 'Manage price alerts',
      icon: <Bell className="h-4 w-4" />,
      action: () => router.push('/alerts'),
      keywords: ['notifications', 'price', 'target'],
      category: 'navigation',
    },
    {
      id: 'export',
      title: 'Export Data',
      subtitle: 'Download your data',
      icon: <Download className="h-4 w-4" />,
      action: () => router.push('/export'),
      keywords: ['csv', 'json', 'download'],
      category: 'navigation',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Manage account settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push('/settings'),
      keywords: ['preferences', 'account', 'billing'],
      category: 'navigation',
    },
  ];

  const symbolItems: CommandItem[] = POPULAR_SYMBOLS.map((s) => ({
    id: `symbol-${s.symbol}`,
    title: s.symbol,
    subtitle: s.name,
    icon: <TrendingUp className="h-4 w-4" />,
    action: () => router.push(`/analyze/${s.symbol}`),
    keywords: [s.symbol.toLowerCase(), s.name.toLowerCase()],
    category: 'symbol' as const,
  }));

  const allItems = [...navigationItems, ...symbolItems];

  const filteredItems = query
    ? allItems.filter((item) => {
        const searchLower = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.subtitle?.toLowerCase().includes(searchLower) ||
          item.keywords?.some((k) => k.includes(searchLower))
        );
      })
    : allItems;

  // Check if query looks like a symbol (all caps, 1-5 chars)
  const isSymbolQuery = /^[A-Z]{1,5}$/.test(query.toUpperCase()) && query.length >= 1;
  const customSymbolItem: CommandItem | null =
    isSymbolQuery && !filteredItems.some((i) => i.title === query.toUpperCase())
      ? {
          id: `custom-${query}`,
          title: query.toUpperCase(),
          subtitle: 'Analyze this symbol',
          icon: <TrendingUp className="h-4 w-4" />,
          action: () => router.push(`/analyze/${query.toUpperCase()}`),
          category: 'symbol',
        }
      : null;

  const displayItems = customSymbolItem
    ? [customSymbolItem, ...filteredItems]
    : filteredItems;

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, displayItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (displayItems[selectedIndex]) {
            displayItems[selectedIndex].action();
            setIsOpen(false);
            setQuery('');
          }
          break;
      }
    },
    [isOpen, displayItems, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const groupedItems = {
    navigation: displayItems.filter((i) => i.category === 'navigation'),
    symbol: displayItems.filter((i) => i.category === 'symbol'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          setIsOpen(false);
          setQuery('');
        }}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-lg bg-background border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search symbols, pages, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
            ESC
          </kbd>
          <button
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
            className="sm:hidden p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {displayItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {groupedItems.navigation.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    Pages
                  </div>
                  {groupedItems.navigation.map((item, index) => {
                    const globalIndex = displayItems.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          globalIndex === selectedIndex
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.title}</div>
                          {item.subtitle && (
                            <div
                              className={`text-sm truncate ${
                                globalIndex === selectedIndex
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {groupedItems.symbol.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    Symbols
                  </div>
                  {groupedItems.symbol.map((item) => {
                    const globalIndex = displayItems.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          globalIndex === selectedIndex
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          {item.subtitle && (
                            <div
                              className={`text-sm truncate ${
                                globalIndex === selectedIndex
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded">↵</kbd> select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
