import { NextResponse } from "next/server";
import { ensureUserInitialized } from "@/lib/auth/user-init";
import { db } from "@/lib/db";
import { mcpPresets } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET: Fetch user's saved presets
export async function GET(request: Request) {
  try {
    const { userId } = await ensureUserInitialized();

    const userPresets = await db
      .select()
      .from(mcpPresets)
      .where(eq(mcpPresets.userId, userId))
      .orderBy(desc(mcpPresets.createdAt));

    return NextResponse.json({
      presets: userPresets,
      count: userPresets.length,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Presets GET error:", { message: errorMessage });

    return NextResponse.json(
      { error: "Failed to fetch presets", details: errorMessage },
      { status: 500 },
    );
  }
}

// POST: Save new preset (Pro tier+ only)
export async function POST(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    // Pro tier+ can save custom presets
    if (tier === "free") {
      return NextResponse.json(
        {
          error: "Upgrade to Pro to save custom presets",
          requiredTier: "pro",
        },
        { status: 403 },
      );
    }

    const { name, description, toolName, parameters, isDefault } =
      await request.json();

    // Validate required fields
    if (!name || !toolName || !parameters) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, toolName, parameters",
        },
        { status: 400 },
      );
    }

    // Create preset
    const preset = await db
      .insert(mcpPresets)
      .values({
        id: nanoid(),
        userId,
        name,
        description: description || null,
        toolName,
        parameters: parameters as any,
        isDefault: isDefault || false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      preset: preset[0],
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Presets POST error:", { message: errorMessage });

    return NextResponse.json(
      { error: "Failed to save preset", details: errorMessage },
      { status: 500 },
    );
  }
}

// PUT: Update an existing preset
export async function PUT(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    if (tier === "free") {
      return NextResponse.json(
        {
          error: "Upgrade to Pro to manage presets",
          requiredTier: "pro",
        },
        { status: 403 },
      );
    }

    const { presetId, name, description, parameters, isDefault } =
      await request.json();

    if (!presetId) {
      return NextResponse.json({ error: "Missing presetId" }, { status: 400 });
    }

    // Verify preset belongs to user
    const existing = await db
      .select()
      .from(mcpPresets)
      .where(and(eq(mcpPresets.id, presetId), eq(mcpPresets.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Update preset
    const updated = await db
      .update(mcpPresets)
      .set({
        name: name || existing[0].name,
        description: description ?? existing[0].description,
        parameters: parameters || existing[0].parameters,
        isDefault: isDefault ?? existing[0].isDefault,
        updatedAt: new Date(),
      })
      .where(eq(mcpPresets.id, presetId))
      .returning();

    return NextResponse.json({
      success: true,
      preset: updated[0],
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Presets PUT error:", { message: errorMessage });

    return NextResponse.json(
      { error: "Failed to update preset", details: errorMessage },
      { status: 500 },
    );
  }
}

// DELETE: Remove a preset
export async function DELETE(request: Request) {
  try {
    const { userId, tier } = await ensureUserInitialized();

    if (tier === "free") {
      return NextResponse.json(
        {
          error: "Upgrade to Pro to manage presets",
          requiredTier: "pro",
        },
        { status: 403 },
      );
    }

    const { presetId } = await request.json();

    if (!presetId) {
      return NextResponse.json({ error: "Missing presetId" }, { status: 400 });
    }

    // Verify preset belongs to user
    const existing = await db
      .select()
      .from(mcpPresets)
      .where(and(eq(mcpPresets.id, presetId), eq(mcpPresets.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Delete preset
    await db.delete(mcpPresets).where(eq(mcpPresets.id, presetId));

    return NextResponse.json({
      success: true,
      message: "Preset deleted",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Presets DELETE error:", { message: errorMessage });

    return NextResponse.json(
      { error: "Failed to delete preset", details: errorMessage },
      { status: 500 },
    );
  }
}
