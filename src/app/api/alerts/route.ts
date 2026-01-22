import { db } from "@/lib/db/client";
import { alerts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ensureUserInitialized } from "@/lib/auth/user-init";

export async function GET(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    if (tier !== "max") {
      return Response.json(
        { error: "Feature available for Max tier only" },
        { status: 403 },
      );
    }

    const userAlerts = await db.query.alerts.findMany({
      where: eq(alerts.userId, userId),
      orderBy: desc(alerts.createdAt),
    });

    return Response.json(userAlerts);
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return Response.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    if (tier !== "max") {
      return Response.json(
        { error: "Feature available for Max tier only" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { symbol, alertType, condition } = body;

    if (!symbol || !alertType || !condition) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newAlert = await db
      .insert(alerts)
      .values({
        id: crypto.randomUUID(),
        userId,
        symbol: symbol.toUpperCase(),
        alertType,
        condition,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return Response.json(newAlert[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create alert:", error);
    return Response.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    if (tier !== "max") {
      return Response.json(
        { error: "Feature available for Max tier only" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { id, isActive } = body;

    if (!id || isActive === undefined) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const updatedAlert = await db
      .update(alerts)
      .set({ isActive, updatedAt: new Date() })
      .where(and(eq(alerts.id, id), eq(alerts.userId, userId)))
      .returning();

    if (updatedAlert.length === 0) {
      return Response.json({ error: "Alert not found" }, { status: 404 });
    }

    return Response.json(updatedAlert[0]);
  } catch (error) {
    console.error("Failed to update alert:", error);
    return Response.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    if (tier !== "max") {
      return Response.json(
        { error: "Feature available for Max tier only" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Alert ID required" }, { status: 400 });
    }

    const deletedAlert = await db
      .delete(alerts)
      .where(and(eq(alerts.id, id), eq(alerts.userId, userId)))
      .returning();

    if (deletedAlert.length === 0) {
      return Response.json({ error: "Alert not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete alert:", error);
    return Response.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
