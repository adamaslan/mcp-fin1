import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/db/queries";
import type { UserTier } from "./tiers";

export async function ensureUserInitialized(): Promise<{
  userId: string;
  email: string;
  tier: UserTier;
}> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get tier from Clerk metadata (defaults to free)
  const tier = (((sessionClaims?.publicMetadata as any)?.tier as string) ||
    "free") as UserTier;

  // Get email from currentUser
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error("User email not found in session");
  }

  // Ensure user exists in database (creates if doesn't exist)
  await getOrCreateUser(userId, email, tier);

  return { userId, email, tier };
}
