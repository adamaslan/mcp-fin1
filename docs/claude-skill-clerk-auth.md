# Claude Skill: Create Clerk Authentication Pages

## Skill Invocation
"Create Clerk sign-up page" or "Add Clerk authentication pages"

## Skill Description
This skill creates production-ready authentication pages (sign-up and sign-in) for Next.js applications using Clerk, with full design system integration, dark mode support, and proper Next.js App Router patterns.

## When to Use This Skill
- Starting a new Next.js project that needs authentication
- Adding auth to an existing Next.js application
- Replacing custom auth with Clerk
- Creating styled Clerk auth pages that match your design system

## Prerequisites Check
Before executing, verify:
1. Next.js 13+ with App Router (`/app` directory exists)
2. Clerk installed (`@clerk/nextjs` in package.json) - if not, install it
3. Tailwind CSS configured
4. Design system with CSS variables (check `globals.css` for `--primary`, `--background`, etc.)

## Implementation Steps

### Step 1: Environment Setup
Ask the user if they have Clerk API keys configured. If not, guide them:

```bash
# Add to .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Step 2: Verify Root Layout
Check `src/app/layout.tsx` has ClerkProvider:

```tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

If missing, add it.

### Step 3: Check/Create Marketing Layout
Look for `src/app/(marketing)/layout.tsx`. If it doesn't exist, create it with:
- Header with navigation
- SignedIn/SignedOut components for conditional rendering
- Links to /sign-in and /sign-up
- Footer

Use this template:

```tsx
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">[APP_NAME]</Link>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Button asChild variant="outline"><Link href="/sign-in">Sign In</Link></Button>
              <Button asChild><Link href="/sign-up">Get Started</Link></Button>
            </SignedOut>
            <SignedIn>
              <Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

Replace `[APP_NAME]` with the actual app name from the project.

### Step 4: Create Sign-Up Page
Create `src/app/(marketing)/sign-up/page.tsx`:

**IMPORTANT PATTERNS:**
1. **Always use `'use client'`** directive at the top
2. **Always implement the `mounted` state pattern** to prevent hydration errors
3. **Center the form** with flexbox
4. **Match the design system** by reading CSS variables from `globals.css`
5. **Use gradient background** or subtle background that matches landing page

Template structure:
```tsx
'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  // CRITICAL: Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            [Compelling call to action based on app purpose]
          </p>
        </div>

        {/* Clerk Component */}
        <SignUp
          redirectUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-card border border-border rounded-lg shadow-sm',
              formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-10 text-sm font-medium',
              formFieldInput: 'bg-input border border-input rounded-md h-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background',
              footerActionLink: 'text-primary hover:text-primary/90 hover:underline',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground text-sm',
              formFieldLabel: 'text-sm font-medium text-foreground',
            },
          }}
        />
      </div>
    </section>
  );
}
```

### Step 5: Create Sign-In Page
Create `src/app/(marketing)/sign-in/page.tsx` using the same pattern:
- Change heading to "Welcome back"
- Change `<SignUp>` to `<SignIn>`
- Swap `redirectUrl` and redirect URLs
- Keep the same styling

### Step 6: Configure Middleware
Check `src/middleware.ts` exists and includes public routes:

```tsx
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

If middleware doesn't exist, create it.

### Step 7: Verify Design System Integration
1. **Read `globals.css`** to understand the project's CSS variables
2. **Match input heights** - common values: `h-9`, `h-10`, `h-11`
3. **Match border radius** - look at existing Button/Card components
4. **Use existing color tokens** - `bg-card`, `border`, `text-foreground`, etc.
5. **Check for custom Button variants** - use the same classes

**Critical:** The appearance.elements styling should match the existing UI components exactly.

### Step 8: Testing Prompt
After creating files, provide this testing checklist to the user:

```
✅ Auth pages created! Please test:

1. Start dev server: npm run dev
2. Navigate to http://localhost:3000/sign-up
3. Verify:
   - [ ] Page loads without errors
   - [ ] Form styling matches your design system
   - [ ] Dark mode works (toggle theme)
   - [ ] Mobile responsive
   - [ ] Sign-up flow completes
   - [ ] Redirects to /dashboard after sign-up
   - [ ] "Already have an account?" link goes to /sign-in

4. Navigate to http://localhost:3000/sign-in
5. Verify same checklist for sign-in page

If you see any styling issues, let me know and I'll adjust the appearance configuration.
```

## Customization Options

### Option 1: Change Layout Style
Ask user: "Do you want center-aligned auth (default) or side-by-side with marketing content?"

For side-by-side:
```tsx
<section className="min-h-screen grid lg:grid-cols-2">
  <div className="flex items-center justify-center p-8">
    {/* Auth form */}
  </div>
  <div className="bg-muted flex items-center justify-center p-8">
    {/* Marketing content, testimonials, features */}
  </div>
</section>
```

### Option 2: Add Logo
Ask user: "Do you want to add a logo above the auth form?"

If yes:
```tsx
<div className="text-center mb-8">
  <Image src="/logo.svg" alt="Logo" width={48} height={48} className="mx-auto mb-4" />
  <h1>...</h1>
</div>
```

### Option 3: Custom Redirect
Ask user: "Where should users go after sign-up? (default: /dashboard)"

Update `redirectUrl` prop accordingly.

### Option 4: OAuth Providers
Remind user: "OAuth providers (Google, GitHub, etc.) are configured in your Clerk Dashboard and will automatically appear in the form."

## Common Pitfalls to Avoid

1. **Don't forget `'use client'`** - Clerk components require client-side rendering
2. **Don't skip the `mounted` state** - Causes hydration errors with themes
3. **Don't hardcode colors** - Use CSS variables for proper theme support
4. **Don't mix design systems** - Match existing Button/Input styling exactly
5. **Don't forget `suppressHydrationWarning`** - Should be on `<html>` tag in root layout
6. **Don't skip middleware** - Routes won't be properly protected

## Success Criteria

The implementation is successful when:
- [ ] Pages load without console errors
- [ ] Styling matches existing design system
- [ ] Light and dark modes both work correctly
- [ ] Sign-up flow completes end-to-end
- [ ] Redirect after auth works
- [ ] Mobile responsive on all breakpoints
- [ ] Keyboard navigation works
- [ ] Focus states are visible and styled

## Post-Implementation

After creating the pages, inform the user about:

1. **User Metadata**: How to add custom fields (use Clerk Dashboard or webhooks)
2. **Email Templates**: Customize in Clerk Dashboard
3. **MFA**: Can be enabled in Clerk Dashboard settings
4. **Webhooks**: Set up to sync user data to their database
5. **Testing**: Test with real email addresses in development

## Example Success Message

"I've created production-ready authentication pages using Clerk! Here's what was set up:

✅ Sign-up page at `/sign-up` with custom styling matching your design system
✅ Sign-in page at `/sign-in` with the same styling
✅ Marketing layout with navigation and user menu
✅ Middleware configured to protect your dashboard routes
✅ Full dark mode support
✅ Mobile responsive design

The pages will redirect users to `/dashboard` after authentication. You can test the flow by running your dev server and visiting `/sign-up`.

Next steps:
- Test the sign-up flow
- Configure OAuth providers in Clerk Dashboard (optional)
- Customize email templates in Clerk Dashboard
- Set up webhooks to sync user data (if needed)

Let me know if you'd like to customize anything!"

## Variables to Extract from Project

When executing this skill, automatically detect:
1. **App name** - from package.json or root README
2. **Primary color** - from globals.css `--primary` variable
3. **Input height** - from existing Input component (usually in `components/ui/input.tsx`)
4. **Border radius** - from existing Card component
5. **Protected route path** - common values: `/dashboard`, `/app`, `/home`
6. **Button component location** - usually `@/components/ui/button`

## Skill Metadata

- **Version:** 1.0
- **Last Updated:** 2024-01-14
- **Minimum Next.js Version:** 13.4
- **Required Dependencies:** `@clerk/nextjs`, `next-themes` (optional for dark mode)
- **Estimated Implementation Time:** 15-30 minutes
- **Difficulty:** Beginner-Intermediate

## Related Skills

- "Add protected routes with Clerk"
- "Create user profile page"
- "Set up role-based access control"
- "Implement user onboarding flow"
