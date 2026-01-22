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
import { useTier } from "@/hooks/useTier";
import { TierGate } from "@/components/gating/TierGate";
import {
  Code,
  Copy,
  Check,
  Key,
  Lock,
  Terminal,
  FileJson,
  Zap,
} from "lucide-react";

const API_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/analyze",
    description: "Get trade plan for a symbol",
    params: [
      {
        name: "symbol",
        type: "string",
        required: true,
        description: "Stock ticker (e.g., AAPL)",
      },
      {
        name: "period",
        type: "string",
        required: false,
        description: "Data period (1mo, 3mo, 6mo, 1y)",
      },
    ],
    example: `curl -X POST https://api.mcpfinance.com/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"symbol": "AAPL", "period": "3mo"}'`,
  },
  {
    method: "POST",
    path: "/api/v1/scan",
    description: "Scan for trade opportunities",
    params: [
      {
        name: "universe",
        type: "string",
        required: false,
        description: "Universe to scan (sp500, nasdaq100, etf)",
      },
      {
        name: "maxResults",
        type: "number",
        required: false,
        description: "Max results to return (default: 10)",
      },
    ],
    example: `curl -X POST https://api.mcpfinance.com/v1/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"universe": "sp500", "maxResults": 25}'`,
  },
  {
    method: "POST",
    path: "/api/v1/portfolio-risk",
    description: "Analyze portfolio risk",
    params: [
      {
        name: "positions",
        type: "array",
        required: true,
        description: "Array of position objects",
      },
    ],
    example: `curl -X POST https://api.mcpfinance.com/v1/portfolio-risk \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"positions": [{"symbol": "AAPL", "shares": 100, "entryPrice": 150}]}'`,
  },
  {
    method: "GET",
    path: "/api/v1/morning-brief",
    description: "Get daily market brief",
    params: [],
    example: `curl https://api.mcpfinance.com/v1/morning-brief \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  },
];

function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default function ApiDocsPage() {
  const { tier } = useTier();
  const hasApiAccess = tier === "max";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Programmatic access to MCP Finance analysis tools.
        </p>
      </div>

      <TierGate feature="api_access" fallback={<ApiAccessUpsell />}>
        {/* API Key Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Your API Key
            </CardTitle>
            <CardDescription>
              Use this key to authenticate API requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                sk_live_••••••••••••••••••••••••••••••
              </div>
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline">Regenerate</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Keep your API key secret. Do not share it or commit it to version
              control.
            </p>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold">1,000</div>
                <div className="text-sm text-muted-foreground">
                  Requests per day
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold">100</div>
                <div className="text-sm text-muted-foreground">
                  Requests per minute
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold">10</div>
                <div className="text-sm text-muted-foreground">
                  Concurrent requests
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Include your API key in the Authorization header:
            </p>
            <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} />
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Endpoints</h2>

          {API_ENDPOINTS.map((endpoint) => (
            <Card key={endpoint.path}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Badge
                    variant={
                      endpoint.method === "GET" ? "secondary" : "default"
                    }
                    className="font-mono"
                  >
                    {endpoint.method}
                  </Badge>
                  <code className="font-mono">{endpoint.path}</code>
                </CardTitle>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Parameters */}
                {endpoint.params.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Parameters</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2 font-medium">Name</th>
                            <th className="text-left p-2 font-medium">Type</th>
                            <th className="text-left p-2 font-medium">
                              Required
                            </th>
                            <th className="text-left p-2 font-medium">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.params.map((param) => (
                            <tr key={param.name} className="border-t">
                              <td className="p-2 font-mono">{param.name}</td>
                              <td className="p-2 text-muted-foreground">
                                {param.type}
                              </td>
                              <td className="p-2">
                                {param.required ? (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Required
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Optional
                                  </Badge>
                                )}
                              </td>
                              <td className="p-2 text-muted-foreground">
                                {param.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Example */}
                <div>
                  <h4 className="font-medium mb-2">Example Request</h4>
                  <CodeBlock code={endpoint.example} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SDKs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              SDKs & Libraries
            </CardTitle>
            <CardDescription>
              Official client libraries (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="font-medium mb-1">Python</div>
                <code className="text-sm text-muted-foreground">
                  pip install mcp-finance
                </code>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Coming Soon
                </Badge>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="font-medium mb-1">JavaScript/Node</div>
                <code className="text-sm text-muted-foreground">
                  npm install mcp-finance
                </code>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Coming Soon
                </Badge>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="font-medium mb-1">REST API</div>
                <code className="text-sm text-muted-foreground">
                  Available Now
                </code>
                <Badge className="ml-2 text-xs">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TierGate>
    </div>
  );
}

function ApiAccessUpsell() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Code className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">API Access is a Max Feature</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Get programmatic access to all MCP Finance tools. Build custom
          integrations, automate your analysis, and integrate with your trading
          systems.
        </p>
        <Button asChild>
          <a href="/pricing">Upgrade to Max</a>
        </Button>
      </CardContent>
    </Card>
  );
}
