"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileJson, FileText } from "lucide-react";

type ExportFormat = "csv" | "json";

export default function ExportPage() {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      const response = await fetch(`/api/export?format=${format}`, {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trade-data-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "json"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export data:", error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Export Data</h1>
        <p className="text-muted-foreground">
          Download your trade journal, portfolio positions, and analysis history
          in various formats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CSV Export
            </CardTitle>
            <CardDescription>
              Spreadsheet format compatible with Excel, Google Sheets, and other
              tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Trade journal entries</li>
                <li>✓ Portfolio positions</li>
                <li>✓ Performance statistics</li>
              </ul>
              <Button
                onClick={() => handleExport("csv")}
                disabled={exporting !== null}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              JSON Export
            </CardTitle>
            <CardDescription>
              Raw JSON format for programmatic access and integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✓ Complete trade history</li>
                <li>✓ All trade metadata</li>
                <li>✓ Analysis signals</li>
              </ul>
              <Button
                onClick={() => handleExport("json")}
                disabled={exporting !== null}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-500/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base">What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <li>
              <strong>Trade Journal:</strong> All logged trades with entry/exit
              prices and P&L
            </li>
            <li>
              <strong>Positions:</strong> Current portfolio holdings and
              historical closes
            </li>
            <li>
              <strong>Statistics:</strong> Win rate, total P&L, and performance
              metrics
            </li>
            <li>
              <strong>Analysis:</strong> Trade plans and signals from past
              searches
            </li>
            <li>
              <strong>Metadata:</strong> Timestamps, notes, and trade
              classifications
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Frequency</CardTitle>
          <CardDescription>
            You can export your data as often as needed. Max tier has unlimited
            exports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>Max Tier</Badge>
              <span className="text-sm">Unlimited exports per day</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Exports are generated on-demand and include all data up to the
              current moment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
