import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { horizon = "1w", top_n = 50 } = await request.json();

    // Validate horizon
    const validHorizons = [
      "1w",
      "2w",
      "1m",
      "2m",
      "3m",
      "6m",
      "52w",
      "2y",
      "3y",
      "5y",
      "10y",
    ];
    if (!validHorizons.includes(horizon)) {
      return NextResponse.json(
        { error: `Invalid horizon. Must be one of: ${validHorizons.join(", ")}` },
        { status: 400 },
      );
    }

    // Call the GCloud industry tracker via the Python MCP backend
    const mcpBackendUrl =
      process.env.MCP_BACKEND_URL || "http://localhost:5000";
    const response = await fetch(`${mcpBackendUrl}/industry-tracker/top`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MCP_BACKEND_TOKEN || ""}`,
      },
      body: JSON.stringify({
        horizon,
        top_n,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[API /mcp/industry-tracker] Backend error:", {
        status: response.status,
        error: errorData,
      });

      return NextResponse.json(
        {
          error: "Failed to fetch industry data",
          message:
            process.env.NODE_ENV === "development"
              ? errorData.message || "Backend error"
              : undefined,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Add metadata
    return NextResponse.json({
      success: true,
      horizon,
      top_n,
      data: data.data || data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("[API /mcp/industry-tracker] Error:", {
      message: errorMessage,
      stack: errorStack,
    });

    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("ECONNREFUSED")
    ) {
      return NextResponse.json(
        {
          error: "Industry tracker service unavailable",
          message: "GCloud industry tracker backend is not responding",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch industry tracker data",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
