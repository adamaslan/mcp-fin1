import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { alerts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check tier - Max only
  const { sessionClaims } = await auth();
  const tier = (sessionClaims?.publicMetadata as any)?.tier || 'free';

  if (tier !== 'max') {
    return Response.json({ error: 'Feature available for Max tier only' }, { status: 403 });
  }

  try {
    const userAlerts = await db.query.alerts.findMany({
      where: eq(alerts.user_id, userId),
      orderBy: (alerts, { desc }) => desc(alerts.created_at),
    });

    return Response.json(userAlerts);
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return Response.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionClaims } = await auth();
  const tier = (sessionClaims?.publicMetadata as any)?.tier || 'free';

  if (tier !== 'max') {
    return Response.json({ error: 'Feature available for Max tier only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { symbol, condition_type, condition_value } = body;

    if (!symbol || !condition_type || condition_value === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAlert = await db.insert(alerts).values({
      user_id: userId,
      symbol: symbol.toUpperCase(),
      condition_type,
      condition_value: parseFloat(condition_value),
      is_active: true,
      created_at: new Date(),
    }).returning();

    return Response.json(newAlert[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create alert:', error);
    return Response.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionClaims } = await auth();
  const tier = (sessionClaims?.publicMetadata as any)?.tier || 'free';

  if (tier !== 'max') {
    return Response.json({ error: 'Feature available for Max tier only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id || is_active === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedAlert = await db
      .update(alerts)
      .set({ is_active })
      .where(and(eq(alerts.id, id), eq(alerts.user_id, userId)))
      .returning();

    if (updatedAlert.length === 0) {
      return Response.json({ error: 'Alert not found' }, { status: 404 });
    }

    return Response.json(updatedAlert[0]);
  } catch (error) {
    console.error('Failed to update alert:', error);
    return Response.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionClaims } = await auth();
  const tier = (sessionClaims?.publicMetadata as any)?.tier || 'free';

  if (tier !== 'max') {
    return Response.json({ error: 'Feature available for Max tier only' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Alert ID required' }, { status: 400 });
    }

    const deletedAlert = await db
      .delete(alerts)
      .where(and(eq(alerts.id, id), eq(alerts.user_id, userId)))
      .returning();

    if (deletedAlert.length === 0) {
      return Response.json({ error: 'Alert not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to delete alert:', error);
    return Response.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
