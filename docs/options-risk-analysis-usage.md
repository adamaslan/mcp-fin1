# Options Risk Analysis - 9th MCP Tool

**Added**: January 27, 2026
**Tool Name**: `options_risk_analysis`
**Purpose**: Analyze options chain risk metrics using real yfinance data with AI-powered insights

---

## Overview

The `options_risk_analysis` tool is the 9th MCP integration that fetches **real options data from yfinance** and provides comprehensive risk analysis including:

- **Real options chain data** (calls and puts)
- **Implied Volatility (IV) analysis**
- **Greeks analysis** (Delta, Gamma, Theta, Vega)
- **Volume and Open Interest analysis**
- **Put/Call Ratio**
- **Liquidity assessment**
- **Risk warnings and opportunities**
- **AI-powered strategy recommendations**

---

## ✅ NO MOCK DATA - 100% REAL DATA

This tool adheres to the critical "NO MOCK DATA" rule:

- Uses `yf.Ticker(symbol).option_chain(date)` for real options data
- Fetches live IV, Greeks, volume, and open interest from Yahoo Finance
- Returns HTTP 503 errors if data is unavailable (never fake data)
- All analysis is based on current market conditions

---

## Quick Start

### 1. Basic Usage

```python
import asyncio
from technical_analysis_mcp import server

# Get options risk analysis for AAPL
result = await server.options_risk_analysis(
    symbol="AAPL",
    option_type="both",  # "calls", "puts", or "both"
    min_volume=10        # Minimum volume for liquid options
)

print(f"Current Price: ${result['current_price']:.2f}")
print(f"Days to Expiration: {result['days_to_expiration']}")
print(f"Put/Call Volume Ratio: {result['put_call_ratio']['volume']:.2f}")
```

### 2. With AI Analysis

```python
from technical_analysis_mcp.ai_analyzer import MCPToolAIAnalyzer

# Get data
result = await server.options_risk_analysis("AAPL")

# Enhance with AI
analyzer = MCPToolAIAnalyzer()
enhanced = analyzer.analyze_options_risk_output(result)

# Access AI insights
ai = enhanced["ai_analysis"]
print(f"Market Sentiment: {ai['market_sentiment']['bias']}")
print(f"IV Level: {ai['iv_analysis']['level']}")
print(f"Recommended Strategies:")
for strategy in ai['strategy_recommendations']:
    print(f"  - {strategy['strategy_name']}: {strategy['reasoning']}")
```

### 3. Run Test

```bash
cd /Users/adamaslan/code/gcp\ app\ w\ mcp
mamba activate fin-ai1
export GEMINI_API_KEY='your-key-here'

# Run full test suite (all 9 tools)
python nu-logs/test_mcp_ai_analysis.py

# Check output
cat nu-logs/test_options_risk_ai.json
```

---

## What the Tool Returns

### Raw Data (from yfinance)

```json
{
  "symbol": "AAPL",
  "current_price": 150.25,
  "expiration_date": "2026-02-20",
  "days_to_expiration": 24,
  "calls": {
    "total_contracts": 50,
    "liquid_contracts": 25,
    "total_volume": 15000,
    "total_open_interest": 45000,
    "avg_implied_volatility": 28.5,
    "atm_strike": 150.0,
    "atm_iv": 29.2,
    "atm_delta": 0.52,
    "top_volume_strikes": [
      {"strike": 150.0, "volume": 5000, "iv": 29.2},
      {"strike": 155.0, "volume": 3000, "iv": 31.5}
    ]
  },
  "puts": {
    "total_contracts": 45,
    "liquid_contracts": 20,
    "total_volume": 12000,
    "total_open_interest": 38000,
    "avg_implied_volatility": 30.1,
    "atm_strike": 150.0,
    "atm_iv": 30.5,
    "atm_delta": -0.48
  },
  "put_call_ratio": {
    "volume": 0.80,
    "open_interest": 0.84
  },
  "risk_warnings": [
    "High implied volatility (28.5%) - options are expensive, consider selling strategies"
  ],
  "opportunities": [
    "Long time to expiration (24 days) - lower theta decay, suitable for longer-term positions"
  ]
}
```

### AI Analysis

```json
{
  "market_sentiment": {
    "bias": "BULLISH",
    "confidence": "MEDIUM",
    "reasoning": "Put/Call ratio of 0.80 indicates more call buying than put buying, suggesting bullish sentiment",
    "key_flow_signals": [
      "Heavy call volume at 150 and 155 strikes",
      "Low put/call ratio indicates bullish positioning"
    ]
  },
  "iv_analysis": {
    "level": "MEDIUM",
    "historical_context": "IV at 28.5% is slightly above average for AAPL",
    "buyer_vs_seller_edge": "Premium sellers have slight edge due to elevated IV",
    "skew_analysis": "Puts trading at slight premium to calls (IV skew suggests some hedging)"
  },
  "strategy_recommendations": [
    {
      "bias": "BULLISH",
      "strategy_name": "Bull Call Spread",
      "strikes": "Buy 150 call, Sell 155 call",
      "reasoning": "Defined risk bullish play with good liquidity at both strikes",
      "risk_reward": "Limited risk ($500 max loss), limited profit ($500 max gain)",
      "suitability": "MODERATE"
    },
    {
      "bias": "NEUTRAL",
      "strategy_name": "Iron Condor",
      "strikes": "Sell 145 put, Buy 140 put, Sell 160 call, Buy 165 call",
      "reasoning": "Profit from time decay and range-bound price action",
      "risk_reward": "Credit received $200, max risk $300",
      "suitability": "CONSERVATIVE"
    }
  ],
  "risk_factors": [
    {
      "factor": "Theta Decay",
      "severity": "MEDIUM",
      "mitigation": "With 24 DTE, theta accelerates after 21 days - manage positions actively"
    }
  ]
}
```

---

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `symbol` | string | **required** | Ticker symbol (e.g., "AAPL", "MSFT") |
| `expiration_date` | string | nearest | Specific expiration (YYYY-MM-DD). If omitted, uses nearest expiration |
| `option_type` | string | "both" | "calls", "puts", or "both" |
| `min_volume` | integer | 10 | Minimum volume threshold for considering options liquid |

---

## Use Cases

### 1. Volatility Analysis
```python
# Check if IV is high or low for options buying/selling
result = await server.options_risk_analysis("TSLA")

if result['calls']['avg_implied_volatility'] > 50:
    print("High IV - consider selling strategies (credit spreads, iron condors)")
else:
    print("Low IV - consider buying strategies (long calls/puts, debit spreads)")
```

### 2. Liquidity Check
```python
# Verify sufficient liquidity before trading
result = await server.options_risk_analysis("NVDA", min_volume=100)

if result['calls']['liquid_contracts'] < 5:
    print("⚠️ Low liquidity - wide bid-ask spreads likely")
else:
    print("✓ Good liquidity - tight spreads expected")
```

### 3. Sentiment Analysis
```python
# Use Put/Call ratio to gauge market sentiment
result = await server.options_risk_analysis("SPY")

pcr = result['put_call_ratio']['volume']
if pcr > 1.0:
    print("Bearish sentiment - more put buying than call buying")
elif pcr < 0.7:
    print("Bullish sentiment - heavy call buying")
else:
    print("Neutral sentiment")
```

### 4. Strategy Selection
```python
# Get AI recommendations for specific market conditions
analyzer = MCPToolAIAnalyzer()
result = await server.options_risk_analysis("AAPL")
enhanced = analyzer.analyze_options_risk_output(result)

# Filter strategies by bias
bullish_strategies = [
    s for s in enhanced['ai_analysis']['strategy_recommendations']
    if s['bias'] == 'BULLISH'
]

for strategy in bullish_strategies:
    print(f"{strategy['strategy_name']}: {strategy['reasoning']}")
```

---

## Integration Points

### 1. Combines with `analyze_security`
```python
# Get stock technical analysis
stock_analysis = await server.analyze_security("AAPL", period="1mo")

# Get options analysis
options_analysis = await server.options_risk_analysis("AAPL")

# Make informed decision
if stock_analysis['summary']['bullish'] > stock_analysis['summary']['bearish']:
    print("Stock technicals are bullish")
    if options_analysis['calls']['avg_implied_volatility'] < 30:
        print("→ Consider buying call options (low IV)")
    else:
        print("→ Consider bull call spreads (high IV)")
```

### 2. Combines with `get_trade_plan`
```python
# Get trade plan for stock
trade_plan = await server.get_trade_plan("MSFT")

# If swing trade, check options viability
if trade_plan['trade_plans']:
    plan = trade_plan['trade_plans'][0]
    if plan['timeframe'] == 'swing':
        options = await server.options_risk_analysis("MSFT")
        # Use options for defined risk
```

---

## Output Files

When you run the test script, the following files are created:

```
nu-logs/
├── test_options_risk_ai.json         # Options risk analysis with AI insights
└── all_mcp_tools_ai_analysis.json    # Combined results from all 9 tools
```

---

## Key Features

### ✅ Real Data Only
- Fetches live options data from yfinance
- No mock data, placeholders, or fake values
- Returns errors if data unavailable

### ✅ Comprehensive Analysis
- IV analysis for calls and puts separately
- Volume and open interest tracking
- Put/Call ratio calculation
- Liquidity assessment

### ✅ AI-Powered Insights
- Market sentiment interpretation
- Strategy recommendations (directional, spreads, income)
- Risk factor identification
- Position sizing guidance

### ✅ Actionable Outputs
- Specific strike recommendations
- Step-by-step execution plans
- Risk mitigation strategies
- Timing considerations (DTE, theta decay)

---

## Error Handling

```python
from technical_analysis_mcp.exceptions import DataFetchError

try:
    result = await server.options_risk_analysis("INVALID")
except DataFetchError as e:
    print(f"Error: {e}")
    # No options data available for this symbol
```

---

## Performance Notes

- **Fetch Time**: ~2-3 seconds per symbol (yfinance API)
- **AI Analysis**: ~1-2 seconds per request (Gemini API)
- **Rate Limiting**: Built into test script (2s delay between tests)
- **Caching**: Not currently cached (real-time data)

---

## Next Steps

1. **Run the test**: `python nu-logs/test_mcp_ai_analysis.py`
2. **Review output**: `cat nu-logs/test_options_risk_ai.json`
3. **Integrate**: Use in your trading workflow
4. **Customize**: Adjust `min_volume` and `expiration_date` for your needs

---

## Related Documentation

- [MCP AI Analysis Guide](mcp-ai-analysis-guide.md) - Full guide for all 9 tools
- [Implementation Summary](mcp-ai-implementation-summary.md) - Technical overview
- [Project Guidelines](../.claude/CLAUDE.md) - NO MOCK DATA rule

---

**Remember**: This tool provides real options data and AI analysis for educational purposes. Always verify data independently and understand the risks before trading options.
