import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
]);

const isMaxOnlyRoute = createRouteMatcher([
  '/dashboard/alerts(.*)',
  '/dashboard/export(.*)',
  '/dashboard/signals(.*)',
  '/api/admin/(.*)',
]);

const isProOnlyRoute = createRouteMatcher([
  '/dashboard/portfolio(.*)',
  '/dashboard/journal(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return (await auth()).redirectToSignIn();
  }

  // Get tier from Clerk metadata (admin-controlled, defaults to 'free')
  const tier = ((sessionClaims?.publicMetadata as any)?.tier as string) || 'free';

  // Check Max-only routes
  if (isMaxOnlyRoute(req) && tier !== 'max') {
    return NextResponse.redirect(new URL('/dashboard?tier_required=max', req.url));
  }

  // Check Pro-only routes
  if (isProOnlyRoute(req) && tier === 'free') {
    return NextResponse.redirect(new URL('/dashboard?tier_required=pro', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
