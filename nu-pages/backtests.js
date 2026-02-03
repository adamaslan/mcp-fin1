import React from "react";
import BacktestConfigurator from "../components/BacktestConfigurator";

export default function BacktestsPage() {
  const run = async (params) => {
    // For now, we just post to an API route /api/run-backtest (implement server-side separately)
    await fetch("/api/run-backtest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    alert("Backtest submitted — check the jobs panel");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Backtests</h1>
      <BacktestConfigurator onRun={run} />
    </div>
  );
}
