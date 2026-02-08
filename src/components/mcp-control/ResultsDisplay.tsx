"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TierGate } from "@/components/gating/TierGate";
import { AIInsights } from "./AIInsights";

interface ResultsDisplayProps {
  toolName: string;
  result: any;
  tier?: string;
}

export function ResultsDisplay({
  toolName,
  result,
  tier = "free",
}: ResultsDisplayProps) {
  if (!result) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No results available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tool-Specific Results */}
      {toolName === "analyze_security" && (
        <AnalyzeSecurityResults result={result} tier={tier} />
      )}

      {toolName === "analyze_fibonacci" && (
        <AnalyzeFibonacciResults result={result} tier={tier} />
      )}

      {toolName === "get_trade_plan" && (
        <GetTradePlanResults result={result} tier={tier} />
      )}

      {toolName === "compare_securities" && (
        <CompareSecuritiesResults result={result} tier={tier} />
      )}

      {toolName === "screen_securities" && (
        <ScreenSecuritiesResults result={result} tier={tier} />
      )}

      {toolName === "scan_trades" && (
        <ScanTradesResults result={result} tier={tier} />
      )}

      {toolName === "portfolio_risk" && (
        <PortfolioRiskResults result={result} tier={tier} />
      )}

      {toolName === "morning_brief" && (
        <MorningBriefResults result={result} tier={tier} />
      )}

      {toolName === "options_risk_analysis" && (
        <OptionsRiskResults result={result} tier={tier} />
      )}

      {/* AI Insights (Pro+ only) */}
      {result.ai_analysis && (
        <TierGate feature="ai_insights" requiredTier="pro">
          <AIInsights aiAnalysis={result.ai_analysis} />
        </TierGate>
      )}
    </div>
  );
}

// Result Components for each tool

function AnalyzeSecurityResults({ result, tier }: any) {
  const signals = (result.signals || []).slice(
    0,
    tier === "free" ? 3 : tier === "pro" ? 10 : 100,
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Symbol</div>
          <div className="font-semibold">{result.symbol}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Price</div>
          <div className="font-semibold">
            ${result.price?.toFixed(2) || "N/A"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="p-2">
          <div className="text-xs text-muted-foreground">Bullish</div>
          <div className="text-lg font-bold text-green-600">
            {result.summary?.bullish || 0}
          </div>
        </Card>
        <Card className="p-2">
          <div className="text-xs text-muted-foreground">Bearish</div>
          <div className="text-lg font-bold text-red-600">
            {result.summary?.bearish || 0}
          </div>
        </Card>
        <Card className="p-2">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-lg font-bold">
            {result.summary?.total_signals || 0}
          </div>
        </Card>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">Top Signals</h4>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {signals.length > 0 ? (
            signals.map((signal: any, i: number) => (
              <div key={i} className="text-xs p-2 bg-muted rounded">
                <div className="font-medium">{signal.signal}</div>
                <div className="text-muted-foreground line-clamp-2">
                  {signal.description}
                </div>
                <div className="flex justify-between mt-1">
                  <Badge variant="outline" className="text-xs">
                    {signal.strength}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {signal.category}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-xs">No signals</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyzeFibonacciResults({ result, tier }: any) {
  const levels = (result.levels || []).slice(0, 10);
  const signals = (result.signals || []).slice(0, tier === "free" ? 3 : 10);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Symbol</div>
          <div className="font-semibold">{result.symbol}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Current Price</div>
          <div className="font-semibold">
            ${result.price?.toFixed(2) || "N/A"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card className="p-2">
          <div className="text-xs text-muted-foreground">Swing High</div>
          <div className="font-semibold">
            ${result.swingHigh?.toFixed(2) || "N/A"}
          </div>
        </Card>
        <Card className="p-2">
          <div className="text-xs text-muted-foreground">Swing Low</div>
          <div className="font-semibold">
            ${result.swingLow?.toFixed(2) || "N/A"}
          </div>
        </Card>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">Key Fibonacci Levels</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {levels.map((level: any, i: number) => (
            <div
              key={i}
              className="flex justify-between text-xs p-1 bg-muted rounded"
            >
              <span className="font-medium">{level.name}</span>
              <span className="font-mono">
                ${level.price?.toFixed(2) || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">Signals</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {signals.length > 0 ? (
            signals.map((signal: any, i: number) => (
              <div key={i} className="text-xs p-1 bg-muted rounded">
                <div className="font-medium">{signal.signal}</div>
                <div className="text-muted-foreground text-xs">
                  {signal.category}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-xs">No signals</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GetTradePlanResults({ result, tier }: any) {
  const trades = result.trade_plans || [];

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-muted-foreground">Symbol</div>
        <div className="font-semibold">{result.symbol}</div>
      </div>

      {trades.length > 0 ? (
        trades.map((trade: any, i: number) => (
          <Card key={i} className="p-3">
            <div className="flex justify-between items-start mb-2">
              <Badge
                variant={trade.direction === "LONG" ? "default" : "secondary"}
              >
                {trade.direction}
              </Badge>
              <Badge variant="outline">{trade.risk_level}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Entry</div>
                <div className="font-semibold">${trade.entry?.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Stop Loss</div>
                <div className="font-semibold text-red-600">
                  ${trade.stop_loss?.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Target 1</div>
                <div className="font-semibold text-green-600">
                  ${trade.target_1?.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">R:R Ratio</div>
                <div className="font-semibold">
                  {trade.risk_reward?.toFixed(2)}:1
                </div>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4 text-sm">
          No qualified trade plans available
        </div>
      )}
    </div>
  );
}

function CompareSecuritiesResults({ result, tier }: any) {
  const comparison = (result.comparison || []).slice(0, 10);

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Comparison Results</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {comparison.map((item: any, i: number) => (
          <Card key={i} className="p-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{item.symbol}</div>
                <div className="text-xs text-muted-foreground">
                  Score: {item.score?.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs">
                  <span className="text-green-600">↑ {item.bullish || 0}</span>
                  {" / "}
                  <span className="text-red-600">↓ {item.bearish || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ScreenSecuritiesResults({ result, tier }: any) {
  const matches = (result.matches || []).slice(0, 20);

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <span className="text-muted-foreground">Results: </span>
        <span className="font-semibold">{matches.length} matches</span>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {matches.map((match: any, i: number) => (
          <div
            key={i}
            className="flex justify-between text-xs p-2 bg-muted rounded"
          >
            <span className="font-semibold">{match.symbol}</span>
            <span className="text-muted-foreground">
              Score: {match.score?.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScanTradesResults({ result, tier }: any) {
  const trades = (result.qualified_trades || []).slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <span className="text-muted-foreground">Qualified Trades: </span>
        <span className="font-semibold">{trades.length}</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {trades.map((trade: any, i: number) => (
          <Card key={i} className="p-2">
            <div className="font-semibold text-sm">{trade.symbol}</div>
            <div className="text-xs text-muted-foreground">
              Quality: {trade.quality_score?.toFixed(0)}/100
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PortfolioRiskResults({ result, tier }: any) {
  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Value</span>
            <span className="font-semibold">
              ${result.total_value?.toFixed(2) || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Max Loss</span>
            <span className="font-semibold text-red-600">
              ${result.total_max_loss?.toFixed(2) || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Risk Level</span>
            <Badge variant="outline">{result.overall_risk_level}</Badge>
          </div>
        </div>
      </Card>

      {result.hedge_suggestions && result.hedge_suggestions.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
          <div className="space-y-1">
            {result.hedge_suggestions.map((suggestion: string, i: number) => (
              <div
                key={i}
                className="text-xs p-2 bg-blue-50 dark:bg-blue-950 rounded"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MorningBriefResults({ result, tier }: any) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        {new Date(result.timestamp).toLocaleDateString()}
      </div>

      <Card className="p-3">
        <h4 className="font-semibold text-sm mb-2">Market Status</h4>
        <div className="space-y-1 text-xs">
          {result.market_status && (
            <div>
              <span className="text-muted-foreground">Status: </span>
              <Badge
                variant={result.market_status.is_open ? "default" : "secondary"}
              >
                {result.market_status.is_open ? "Open" : "Closed"}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {result.summary && (
        <div className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
          {result.summary}
        </div>
      )}
    </div>
  );
}

function OptionsRiskResults({ result, tier }: any) {
  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Symbol</span>
            <span className="font-semibold">{result.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Expiration</span>
            <span className="font-semibold">{result.expiration_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Days to Exp</span>
            <span className="font-semibold">{result.days_to_expiration}</span>
          </div>
        </div>
      </Card>

      {result.risk_warnings && result.risk_warnings.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">⚠️ Risk Warnings</h4>
          <div className="space-y-1">
            {result.risk_warnings.map((warning: string, i: number) => (
              <div
                key={i}
                className="text-xs p-2 bg-red-50 dark:bg-red-950 rounded"
              >
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.opportunities && result.opportunities.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">💡 Opportunities</h4>
          <div className="space-y-1">
            {result.opportunities.map((opp: string, i: number) => (
              <div
                key={i}
                className="text-xs p-2 bg-green-50 dark:bg-green-950 rounded"
              >
                {opp}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
