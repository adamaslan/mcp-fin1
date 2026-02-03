import React, { useState } from "react";

export default function BacktestConfigurator({ onRun }) {
  const [params, setParams] = useState({
    lookback: 90,
    top_n: 20,
    weighting: "equal",
    rebalance: "monthly",
    transaction_cost_bps: 5,
    slippage_model: "pct_of_spread",
    stop_loss_pct: 0,
    take_profit_pct: 0,
    max_leverage: 1,
    universe: "",
    starting_cash: 1.0,
    fixed_fee: 0.0,
  });
  const [advanced, setAdvanced] = useState(false);

  const handleChange = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  const handleRun = () => {
    // simple validation
    if (params.lookback <= 0 || params.top_n <= 0) {
      alert("Lookback and Top N must be positive");
      return;
    }
    if (params.transaction_cost_bps < 0) {
      alert("Transaction costs must be >= 0");
      return;
    }
    if (params.starting_cash <= 0) {
      alert("Starting cash must be > 0");
      return;
    }
    if (onRun) onRun(params);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Backtest Configurator</h2>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">Lookback (days)</span>
          <input
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            type="number"
            value={params.lookback}
            onChange={(e) =>
              handleChange("lookback", parseInt(e.target.value || "0"))
            }
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Top N</span>
          <input
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            type="number"
            value={params.top_n}
            onChange={(e) =>
              handleChange("top_n", parseInt(e.target.value || "0"))
            }
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Weighting</span>
          <select
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            value={params.weighting}
            onChange={(e) => handleChange("weighting", e.target.value)}
          >
            <option value="equal">Equal</option>
            <option value="risk_parity">Risk Parity</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Rebalance</span>
          <select
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            value={params.rebalance}
            onChange={(e) => handleChange("rebalance", e.target.value)}
          >
            <option>monthly</option>
            <option>weekly</option>
            <option>daily</option>
          </select>
        </label>
        <label className="block col-span-2">
          <span className="text-sm font-medium">Transaction cost (bps)</span>
          <input
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            type="number"
            value={params.transaction_cost_bps}
            onChange={(e) =>
              handleChange(
                "transaction_cost_bps",
                parseFloat(e.target.value || "0"),
              )
            }
          />
        </label>
        <label className="block col-span-2">
          <span className="text-sm font-medium">
            Universe (CSV URL or comma list)
          </span>
          <input
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            value={params.universe}
            onChange={(e) => handleChange("universe", e.target.value)}
          />
        </label>

        <div className="col-span-2 flex items-center justify-between">
          <button
            className="text-sm text-gray-600"
            onClick={() => setAdvanced((a) => !a)}
          >
            {advanced ? "Hide Advanced" : "Show Advanced"}
          </button>
          <div className="text-sm text-gray-500">
            Advanced: starting cash, fixed fee, etc.
          </div>
        </div>

        {advanced && (
          <>
            <label className="block">
              <span className="text-sm font-medium">Starting cash</span>
              <input
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
                type="number"
                value={params.starting_cash}
                onChange={(e) =>
                  handleChange(
                    "starting_cash",
                    parseFloat(e.target.value || "1.0"),
                  )
                }
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Fixed fee per trade</span>
              <input
                className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
                type="number"
                value={params.fixed_fee}
                onChange={(e) =>
                  handleChange("fixed_fee", parseFloat(e.target.value || "0.0"))
                }
              />
            </label>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={handleRun}
        >
          Run Backtest
        </button>
        <button
          className="text-sm text-gray-500"
          onClick={() =>
            navigator.clipboard &&
            navigator.clipboard.writeText(JSON.stringify(params, null, 2))
          }
        >
          Copy JSON
        </button>
      </div>
    </div>
  );
}
