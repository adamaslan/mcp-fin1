"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Zap,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EndpointResult {
  status_code: number;
  elapsed_seconds: number;
  response: Record<string, unknown>;
}

interface CloudResults {
  test_timestamp: string;
  service_url: string;
  endpoints: Record<string, EndpointResult>;
  summary: {
    total_endpoints: number;
    passed: number;
    failed: number;
    pass_rate: string;
  };
}

const cloudResults: CloudResults = {
  test_timestamp: "2026-02-12T14:33:13Z",
  service_url: "https://options-mcp-backend-cif7ppahzq-uc.a.run.app",
  endpoints: {
    "GET /": {
      status_code: 200,
      elapsed_seconds: 0.36,
      response: {
        service: "Options MCP Backend",
        version: "2.0.0",
        status: "healthy",
        mcp_available: true,
        ai_available: true,
        pipeline_available: true,
      },
    },
    "GET /health": {
      status_code: 200,
      elapsed_seconds: 0.55,
      response: {
        status: "degraded",
        checks: {
          mcp_server: "ok",
          python:
            "3.11.14 | packaged by conda-forge | (main, Jan 26 2026, 23:48:32) [GCC 14.3.0]",
          yfinance: "ok",
        },
      },
    },
    "POST /api/options-risk": {
      status_code: 200,
      elapsed_seconds: 0.81,
      response: {
        success: true,
        data: {
          symbol: "AAPL",
          current_price: 261.98,
          calls: {
            total_contracts: 58,
            liquid_contracts: 18,
            total_volume: 291780,
            avg_implied_volatility: 115.49909859071927,
          },
          puts: {
            total_contracts: 54,
            liquid_contracts: 25,
            total_volume: 228055,
            avg_implied_volatility: 98.49170010941117,
          },
        },
      },
    },
    "POST /api/options-summary": {
      status_code: 200,
      elapsed_seconds: 0.54,
      response: {
        success: true,
        data: {
          symbol: "AAPL",
          current_price: 261.98,
          sentiment: "neutral",
          risk_level: "high",
        },
      },
    },
    "POST /api/options-vehicle": {
      status_code: 200,
      elapsed_seconds: 0.7,
      response: {
        success: true,
        data: {
          vehicle: "option_call",
          reasoning: "Consider ATM calls for directional bullish play",
          expected_move_percent: 3.0,
          volatility_regime: "medium",
        },
      },
    },
    "POST /api/options-compare": {
      status_code: 200,
      elapsed_seconds: 1.53,
      response: {
        success: true,
        data: {
          symbols: [
            {
              symbol: "NVDA",
              current_price: 189.42,
              atm_iv: 38.98986791992188,
            },
            {
              symbol: "AAPL",
              current_price: 261.85,
              atm_iv: 32.37372314453124,
            },
            {
              symbol: "MSFT",
              current_price: 405.715,
              atm_iv: 25.72095764160156,
            },
          ],
        },
      },
    },
    "POST /api/spread-trade (OPEN)": {
      status_code: 200,
      elapsed_seconds: 6.83,
      response: {
        success: true,
        data: {
          symbol: "AAPL",
          spread_type: "bull_call",
          max_profit: 244.0,
          max_loss: 256.0,
          risk_reward_ratio: 0.95,
        },
      },
    },
    "POST /api/spread-trade (CLOSE)": {
      status_code: 200,
      elapsed_seconds: 6.96,
      response: {
        success: true,
        data: {
          symbol: "AAPL",
          spread_type: "bear_put",
          max_profit: 245.0,
          max_loss: 255.0,
          risk_reward_ratio: 0.96,
        },
      },
    },
    "POST /api/options-enhanced": {
      status_code: 200,
      elapsed_seconds: 4.97,
      response: {
        success: true,
        data: {
          symbol: "AAPL",
          risk_analysis: { status: "ok" },
          summary: { status: "ok" },
          vehicle_recommendation: { status: "ok" },
          enhanced_fields: { status: "ok" },
        },
      },
    },
    "POST /api/options-ai": {
      status_code: 200,
      elapsed_seconds: 8.86,
      response: {
        success: true,
        data: {
          symbol: "AAPL",
          market_sentiment: { bias: "NEUTRAL", confidence: "LOW" },
          iv_analysis: { level: "EXTREMELY HIGH" },
        },
      },
    },
    "POST /api/pipeline/run-single": {
      status_code: 200,
      elapsed_seconds: 17.84,
      response: {
        success: true,
        data: {
          symbol: "MSFT",
          options_chain: {
            status: "ok",
            expirations: 25,
            total_calls: 1963,
            total_puts: 1963,
          },
        },
      },
    },
    "POST /api/pipeline/run": {
      status_code: 200,
      elapsed_seconds: 17.86,
      response: {
        success: true,
        data: {
          status: "completed",
          symbols_processed: 1,
          symbols: ["NVDA"],
        },
      },
    },
  },
  summary: {
    total_endpoints: 12,
    passed: 12,
    failed: 0,
    pass_rate: "12/12",
  },
};

function StatusBadge({ code }: { code: number }) {
  const isSuccess = code >= 200 && code < 300;
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isSuccess
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      }`}
    >
      {isSuccess && <CheckCircle2 className="w-4 h-4" />}
      {code}
    </span>
  );
}

function EndpointCard({
  name,
  result,
}: {
  name: string;
  result: EndpointResult;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader
        className="pb-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-mono text-primary">
              {name}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <StatusBadge code={result.status_code} />
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{result.elapsed_seconds.toFixed(2)}s</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0">
          <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-foreground/80">
              {JSON.stringify(result.response, null, 2)}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function SummaryStats() {
  const stats = cloudResults.summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total_endpoints}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Passed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.passed}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${
              stats.failed === 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {stats.failed}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pass Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.pass_rate}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceHeader() {
  const timestamp = new Date(cloudResults.test_timestamp);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 rounded-lg p-6 text-white mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cloud Run Test Results</h1>
          <p className="text-blue-100 mb-4">{cloudResults.service_url}</p>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            <span>Tested: {timestamp.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold mb-2">
            {cloudResults.summary.passed}/{cloudResults.summary.total_endpoints}
          </div>
          <p className="text-blue-100">Endpoints Passing</p>
        </div>
      </div>
    </div>
  );
}

export default function CloudResultsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const endpointNames = useMemo(() => Object.keys(cloudResults.endpoints), []);

  const filteredEndpoints = useMemo(() => {
    return endpointNames.filter((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [endpointNames, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        <ServiceHeader />
        <SummaryStats />

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Endpoint Details</h2>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {filteredEndpoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No endpoints found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredEndpoints.map((name) => (
              <EndpointCard
                key={name}
                name={name}
                result={cloudResults.endpoints[name]}
              />
            ))
          )}
        </div>

        {/* Additional metadata */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service URL:</span>
                <span className="font-mono">{cloudResults.service_url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Test Timestamp:</span>
                <span className="font-mono">
                  {new Date(cloudResults.test_timestamp).toISOString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total Endpoints Tested:
                </span>
                <span className="font-mono">
                  {cloudResults.summary.total_endpoints}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
