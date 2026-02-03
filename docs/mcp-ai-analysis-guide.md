# MCP Tools AI Analysis Guide

## Overview

This guide explains how to enhance all 9 MCP tool outputs with AI-powered natural language analysis using Google's Gemini API.

**Similar to**: `nu-logs/options_ai_analyzer.py` (for options portfolio risk)
**But for**: All 9 stock technical analysis and options MCP tools

---

## The 9 MCP Tools

1. **`analyze_security`** - Analyze any stock/ETF with 150+ technical signals
2. **`compare_securities`** - Compare multiple stocks/ETFs and find the best pick
3. **`screen_securities`** - Screen securities matching technical criteria
4. **`get_trade_plan`** - Get risk-qualified trade plan with suppression reasons
5. **`scan_trades`** - Scan universe for qualified trade setups
6. **`portfolio_risk`** - Assess aggregate risk across positions
7. **`morning_brief`** - Generate daily market briefing with signals and market conditions
8. **`analyze_fibonacci`** - Comprehensive Fibonacci analysis with 40+ levels and 200+ signals
9. **`options_risk_analysis`** - Analyze options chain risk metrics with real yfinance data (IV, Greeks, P/C ratio)

---

## What AI Analysis Provides

The AI analyzer takes the raw technical data from each MCP tool and provides:

### For `analyze_security`:
- **Market Bias** - Bullish/bearish/neutral assessment with reasoning
- **Key Drivers** - Top 3 signals driving the setup
- **Indicator Analysis** - Plain-English explanation of RSI, MACD, ADX, Volume
- **Signal Quality** - Confirmation level and conflicting signals
- **Trading Implications** - Setup type, timeframe, entry considerations
- **Risk Factors** - Top 3 risks to watch
- **Action Items** - Prioritized next steps
- **Plain English Summary** - For non-technical readers

### For `compare_securities`:
- **Ranking Rationale** - Why the winner ranks #1
- **Detailed Comparison** - Strengths/weaknesses of top 3 securities
- **Recommendations** - Best picks for aggressive vs. conservative traders
- **Sector Insights** - Any sector patterns
- **Action Plan** - How to act on the comparison

### For `screen_securities`:
- **Screening Effectiveness** - Quality assessment of results
- **Top Picks** - Highlighted best opportunities
- **Pattern Recognition** - Common characteristics
- **Criteria Assessment** - Were the screening criteria effective?
- **Refinement Suggestions** - How to improve the screen

### For `get_trade_plan`:
- **Trade Assessment** - Quality and conviction level
- **Risk Analysis** - Stop placement, R:R ratio, position sizing
- **Execution Plan** - Step-by-step entry guide
- **Monitoring Checklist** - What to watch during the trade
- **Exit Strategy** - Profit targets and stop-loss rules
- **Suppression Reasons** - Why no tradeable setup (if suppressed)

### For `scan_trades`:
- **Scan Quality** - Hit rate and overall assessment
- **Best Opportunities** - Top 3 trades with detailed reasoning
- **Market Themes** - Patterns and dominant bias
- **Portfolio Construction** - How to combine trades
- **Prioritization** - How to choose if can't take all
- **Risk Management** - Aggregate risk guidance

### For `portfolio_risk`:
- **Risk Assessment** - Overall portfolio risk evaluation
- **Position Analysis** - Individual position risks
- **Concentration Analysis** - Sector/correlation risks
- **Hedge Recommendations** - Hedging strategies
- **Rebalancing Suggestions** - Portfolio improvement ideas
- **Stress Scenarios** - What could go wrong
- **Action Items** - Prioritized risk management steps

### For `morning_brief`:
- **Market Outlook** - Today's bias and volatility expectation
- **Top Opportunities** - Best trades for today
- **Key Risks** - What could disrupt the market
- **Sector Rotation** - Leaders and laggards
- **Trading Strategy** - Aggressive/moderate/conservative approach
- **Time-Specific Guidance** - Pre-market, open, midday, close strategies

### For `analyze_fibonacci`:
- **Fibonacci Setup** - Type and quality of setup
- **Key Levels** - Most important levels to watch
- **Price Action Context** - Where is price in the structure
- **Trading Zones** - Entry, stop, and target zones
- **Confluence Analysis** - Strongest confluence zones
- **Setup Quality** - Score with pros/cons
- **Execution Guide** - How to trade the setup

### For `options_risk_analysis`:
- **Market Sentiment** - What options flow reveals about sentiment (bullish/bearish/neutral)
- **IV Analysis** - Implied volatility interpretation (high/medium/low, buyer vs seller edge)
- **Liquidity Assessment** - Tradability evaluation with best liquid strikes
- **Strategy Recommendations** - Specific strategies for bullish, bearish, and neutral biases
- **Risk Factors** - Time decay, volatility risks, liquidity concerns
- **Optimal Strikes** - Recommended strikes for directional, spreads, and income strategies
- **Position Sizing** - Allocation guidance based on IV, DTE, and liquidity
- **Action Plan** - Step-by-step execution guide for options trades

---

## Setup Instructions

### 1. Install Dependencies

```bash
# Activate your mamba environment
mamba activate fin-ai1

# Install google-generativeai
mamba install -c conda-forge google-generativeai

# Or if not in conda-forge:
pip install google-generativeai
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key (free tier available)
3. Set environment variable:

```bash
export GEMINI_API_KEY='your-api-key-here'

# Or add to .env file
echo "GEMINI_API_KEY=your-api-key-here" >> .env
```

### 3. Files Created

- **`mcp-finance1/src/technical_analysis_mcp/ai_analyzer.py`** - Main AI analyzer class
- **`nu-logs/test_mcp_ai_analysis.py`** - Test script for all 8 tools
- **`nu-docs/mcp-ai-analysis-guide.md`** - This documentation

---

## Usage Examples

### Basic Usage - Single Tool

```python
import asyncio
from technical_analysis_mcp import server
from technical_analysis_mcp.ai_analyzer import MCPToolAIAnalyzer

async def analyze_with_ai():
    # Step 1: Get data from MCP tool
    result = await server.analyze_security("AAPL", period="1mo")

    # Step 2: Enhance with AI
    analyzer = MCPToolAIAnalyzer()
    enhanced = analyzer.analyze_security_output(result)

    # Step 3: Format report
    report = analyzer.format_analysis_report(
        "analyze_security",
        result,
        enhanced
    )
    print(report)

    return enhanced

asyncio.run(analyze_with_ai())
```

### Using with All 8 Tools

```python
import asyncio
from technical_analysis_mcp import server
from technical_analysis_mcp.ai_analyzer import MCPToolAIAnalyzer

async def analyze_all_tools():
    analyzer = MCPToolAIAnalyzer()

    # Tool 1: Analyze Security
    result1 = await server.analyze_security("AAPL")
    enhanced1 = analyzer.analyze_security_output(result1)

    # Tool 2: Compare Securities
    result2 = await server.compare_securities(["AAPL", "MSFT", "GOOGL"])
    enhanced2 = analyzer.analyze_comparison_output(result2)

    # Tool 3: Get Trade Plan
    result3 = await server.get_trade_plan("AAPL")
    enhanced3 = analyzer.analyze_trade_plan_output(result3)

    # Tool 4: Scan Trades
    result4 = await server.scan_trades("etf_large_cap", max_results=5)
    enhanced4 = analyzer.analyze_scan_output(result4)

    # Tool 5: Portfolio Risk
    positions = [
        {"symbol": "AAPL", "shares": 100, "entry_price": 150.0},
        {"symbol": "MSFT", "shares": 50, "entry_price": 380.0},
    ]
    result5 = await server.portfolio_risk(positions)
    enhanced5 = analyzer.analyze_portfolio_risk_output(result5)

    # Tool 6: Morning Brief
    result6 = await server.morning_brief(["AAPL", "MSFT"])
    enhanced6 = analyzer.analyze_morning_brief_output(result6)

    # Tool 7: Analyze Fibonacci
    result7 = await server.analyze_fibonacci("AAPL")
    enhanced7 = analyzer.analyze_fibonacci_output(result7)

    # Tool 8: Screen Securities
    criteria = {"rsi": {"min": 30, "max": 70}, "min_score": 60}
    result8 = await server.screen_securities("etf_large_cap", criteria)
    enhanced8 = analyzer.analyze_screening_output(result8)

    return {
        "analyze_security": enhanced1,
        "compare_securities": enhanced2,
        "get_trade_plan": enhanced3,
        "scan_trades": enhanced4,
        "portfolio_risk": enhanced5,
        "morning_brief": enhanced6,
        "analyze_fibonacci": enhanced7,
        "screen_securities": enhanced8,
    }

asyncio.run(analyze_all_tools())
```

### Run the Comprehensive Test Script

```bash
# Make sure GEMINI_API_KEY is set
export GEMINI_API_KEY='your-key-here'

# Run the test script
cd /Users/adamaslan/code/gcp\ app\ w\ mcp
python nu-logs/test_mcp_ai_analysis.py
```

This will:
1. Test all 8 MCP tools
2. Enhance each with AI analysis
3. Generate formatted reports
4. Save results to `nu-logs/test_*_ai.json`
5. Create combined results in `all_mcp_tools_ai_analysis.json`

---

## Output Format

All AI analysis is returned as structured JSON with these sections (varies by tool):

```json
{
  "symbol": "AAPL",
  "price": 150.25,
  "change": 2.5,
  "summary": { ... },
  "signals": [ ... ],
  "ai_analysis": {
    "market_bias": "BULLISH",
    "bias_explanation": "Strong bullish momentum with...",
    "key_drivers": [
      {
        "signal": "MACD Bullish Crossover",
        "importance": "HIGH",
        "explanation": "MACD crossed above signal line..."
      }
    ],
    "indicator_analysis": {
      "rsi": "RSI at 65.5 shows moderate overbought...",
      "macd": "Positive MACD indicates upward momentum...",
      "adx": "ADX at 28 suggests a developing trend...",
      "volume": "Above-average volume confirms the move..."
    },
    "signal_quality": {
      "confirmation_level": "HIGH",
      "conflicting_signals": [],
      "conviction": "HIGH",
      "explanation": "Multiple indicators confirming bullish bias..."
    },
    "trading_implications": {
      "setup_type": "Momentum Breakout",
      "timeframe": "Swing Trade (3-7 days)",
      "entry_considerations": "Look for pullback to support..."
    },
    "risk_factors": [
      {
        "risk": "Overbought RSI",
        "severity": "MEDIUM",
        "mitigation": "Wait for RSI to cool off or use wider stops"
      }
    ],
    "action_items": [
      {
        "priority": 1,
        "timeframe": "TODAY",
        "action": "Monitor for entry on pullback to $148"
      }
    ],
    "plain_english_summary": "AAPL is in a strong uptrend with bullish momentum..."
  }
}
```

---

## Integration with MCP Server

To integrate AI analysis directly into the MCP server responses:

### Option 1: Add `use_ai_analysis` parameter to tools

```python
# In server.py

@app.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Route tool calls to appropriate handlers."""
    try:
        use_ai_analysis = arguments.pop("use_ai_analysis", False)

        if name == "analyze_security":
            result = await analyze_security(**arguments)

            # Optionally enhance with AI
            if use_ai_analysis and os.getenv("GEMINI_API_KEY"):
                from .ai_analyzer import MCPToolAIAnalyzer
                analyzer = MCPToolAIAnalyzer()
                result = analyzer.analyze_security_output(result)

            return [TextContent(type="text", text=format_analysis(result))]

        # ... same for other tools
```

### Option 2: Separate AI-enhanced tools

```python
# Add new tools with "_ai" suffix

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        # Original tools
        Tool(name="analyze_security", ...),
        Tool(name="compare_securities", ...),
        # ... 6 more tools

        # AI-enhanced versions
        Tool(
            name="analyze_security_ai",
            description="Analyze security WITH AI-powered insights",
            inputSchema={...}
        ),
        # ... 7 more AI-enhanced tools
    ]
```

---

## Performance Notes

### API Call Costs

- **Model**: Gemini 1.5 Flash (fast and cheap)
- **Free Tier**: 15 requests/minute, 1 million tokens/day
- **Cost**: $0.075 per 1M input tokens, $0.30 per 1M output tokens

### Rate Limits

- Add `await asyncio.sleep(2)` between calls to avoid rate limits
- The test script includes rate limiting courtesy delays

### Caching

The AI analyzer doesn't cache responses (each call is fresh). To add caching:

```python
from cachetools import TTLCache

class MCPToolAIAnalyzer:
    def __init__(self, api_key: str | None = None):
        # ... existing init
        self._cache = TTLCache(maxsize=100, ttl=3600)  # 1 hour TTL

    def analyze_security_output(self, result: dict[str, Any]) -> dict[str, Any]:
        symbol = result.get("symbol")
        cache_key = f"analyze_security:{symbol}"

        if cache_key in self._cache:
            return self._cache[cache_key]

        # ... do AI analysis
        enhanced = result.copy()
        enhanced["ai_analysis"] = ai_analysis

        self._cache[cache_key] = enhanced
        return enhanced
```

---

## Troubleshooting

### "GEMINI_API_KEY not set"

```bash
# Check if set
echo $GEMINI_API_KEY

# Set temporarily
export GEMINI_API_KEY='your-key-here'

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export GEMINI_API_KEY="your-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### "google-generativeai not installed"

```bash
# Try conda-forge first
mamba install -c conda-forge google-generativeai

# If not available, use pip
pip install google-generativeai
```

### "Rate limit exceeded"

Add delays between API calls:

```python
import asyncio

result1 = await server.analyze_security("AAPL")
enhanced1 = analyzer.analyze_security_output(result1)

await asyncio.sleep(2)  # Wait 2 seconds

result2 = await server.analyze_security("MSFT")
enhanced2 = analyzer.analyze_security_output(result2)
```

### "JSON parsing error"

The AI sometimes returns markdown-wrapped JSON. The analyzer handles this automatically:

```python
def _parse_ai_response(self, response_text: str) -> dict[str, Any]:
    cleaned = response_text.strip()

    # Remove markdown code blocks
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    return json.loads(cleaned.strip())
```

If parsing still fails, check `enhanced["ai_analysis"]["raw_response"]` for the original text.

---

## Comparison with Options AI Analyzer

| Feature | Options AI Analyzer | MCP Tools AI Analyzer |
|---------|---------------------|----------------------|
| **Purpose** | Analyze options portfolio risk | Analyze stock technical signals |
| **Tools** | 1 (options risk assessment) | 8 (all MCP tools) |
| **Model** | Gemini 1.5 Flash | Gemini 1.5 Flash |
| **Input** | Greeks, positions, risk metrics | Technical indicators, signals, levels |
| **Output** | Portfolio risk insights | Trading insights for each tool |
| **File** | `nu-logs/options_ai_analyzer.py` | `mcp-finance1/src/technical_analysis_mcp/ai_analyzer.py` |

---

## Next Steps

1. **Run the test script** to verify everything works:
   ```bash
   python nu-logs/test_mcp_ai_analysis.py
   ```

2. **Integrate into your workflow**:
   - Add AI analysis to MCP server responses
   - Use in your trading dashboard
   - Create daily automated reports

3. **Customize prompts** for your trading style:
   - Edit `_build_*_prompt()` methods in `ai_analyzer.py`
   - Adjust prompt templates for your preferences

4. **Build a dashboard** that shows:
   - Raw technical data side-by-side with AI insights
   - Action items from all tools
   - Prioritized trading opportunities

---

## Example Output Snippet

```json
{
  "symbol": "AAPL",
  "price": 150.25,
  "ai_analysis": {
    "market_bias": "BULLISH",
    "bias_explanation": "Strong bullish momentum confirmed by MACD crossover, RSI trending higher, and increasing volume. Multiple technical indicators align for a continuation setup.",
    "key_drivers": [
      {
        "signal": "MACD Bullish Crossover",
        "importance": "HIGH",
        "explanation": "MACD line crossed above signal line with expanding histogram, indicating strengthening upward momentum"
      }
    ],
    "action_items": [
      {
        "priority": 1,
        "timeframe": "TODAY",
        "action": "Monitor for entry on pullback to $148-149 support zone"
      }
    ]
  }
}
```

---

## Questions?

- Check the code: `mcp-finance1/src/technical_analysis_mcp/ai_analyzer.py`
- Run examples: `nu-logs/test_mcp_ai_analysis.py`
- See options example: `nu-logs/options_ai_analyzer.py`

Happy trading! 🚀📈
