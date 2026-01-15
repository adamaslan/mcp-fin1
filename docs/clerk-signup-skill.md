# Claude Skill: Clerk Sign-Up Page Implementation

## Overview
This skill provides a reusable pattern for implementing authentication pages (sign-up, sign-in) in Next.js applications using Clerk with custom styling that matches your design system.

## Skill Purpose
Create fully-styled, production-ready authentication pages that:
- Use Clerk's secure hosted components
- Match your existing design system (Tailwind CSS)
- Support dark mode and theme switching
- Provide optimal UX with proper loading states
- Integrate seamlessly with your Next.js routing

## Prerequisites
- Next.js 13+ with App Router
- Clerk installed and configured: `npm install @clerk/nextjs`
- Tailwind CSS configured with design tokens
- ClerkProvider wrapped around your app (in root layout)

## Implementation Pattern

### 1. Project Structure
```
src/app/
├── (marketing)/          # Marketing/public pages layout group
│   ├── layout.tsx       # Header/footer for public pages
│   ├── sign-up/
│   │   └── page.tsx     # Sign-up page
│   └── sign-in/
│       └── page.tsx     # Sign-in page
└── layout.tsx           # Root layout with ClerkProvider
```

### 2. Root Layout Setup
Ensure ClerkProvider wraps your entire app:

```tsx
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            themes={['light', 'dark', 'dark-oled']}
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 3. Marketing Layout with Navigation
Create a layout that includes auth navigation:

```tsx
// src/app/(marketing)/layout.tsx
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Your App Name
          </Link>

          <div className="flex items-center gap-4">
            <SignedOut>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            </SignedOut>
            <SignedIn>
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 Your App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
```

### 4. Sign-Up Page Template

```tsx
// src/app/(marketing)/sign-up/page.tsx
'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  // Prevent hydration mismatch with theme switching
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Start your journey today
          </p>
        </div>

        {/* Clerk Sign-Up Component */}
        <SignUp
          redirectUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              // Container
              rootBox: 'w-full',
              card: 'bg-card border border-border rounded-lg shadow-sm',

              // Primary Button
              formButtonPrimary:
                'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-10 text-sm font-medium',

              // Input Fields
              formFieldInput:
                'bg-input border border-input rounded-md h-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background',

              // Links
              footerActionLink:
                'text-primary hover:text-primary/90 hover:underline',

              // Divider (for OAuth options)
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground text-sm',

              // Labels
              formFieldLabel: 'text-sm font-medium text-foreground',
            },
          }}
        />
      </div>
    </section>
  );
}
```

### 5. Sign-In Page Template

```tsx
// src/app/(marketing)/sign-in/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account
          </p>
        </div>

        <SignIn
          redirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-card border border-border rounded-lg shadow-sm',
              formButtonPrimary:
                'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-10 text-sm font-medium',
              formFieldInput:
                'bg-input border border-input rounded-md h-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background',
              footerActionLink:
                'text-primary hover:text-primary/90 hover:underline',
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

### 6. Middleware Configuration

Ensure Clerk middleware protects your routes:

```tsx
// src/middleware.ts
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

## Design System Integration

### Required CSS Variables
Ensure your `globals.css` has these design tokens:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### Appearance Customization Reference

The `appearance` prop accepts these commonly styled elements:

```tsx
appearance={{
  elements: {
    // Layout
    rootBox: 'w-full',                    // Outer container
    card: 'custom-card-styles',           // Form card
    header: 'custom-header-styles',       // Top section

    // Form Elements
    formFieldInput: 'custom-input',       // Text inputs
    formFieldLabel: 'custom-label',       // Input labels
    formButtonPrimary: 'custom-button',   // Primary CTA button

    // Links and Text
    footerActionLink: 'custom-link',      // "Sign in instead" links
    identityPreviewText: 'custom-text',   // Identity display text

    // Dividers (for OAuth)
    dividerLine: 'custom-divider',        // Horizontal line
    dividerText: 'custom-divider-text',   // "or" text

    // OAuth Buttons
    socialButtonsBlockButton: 'custom-oauth-btn',
    socialButtonsBlockButtonText: 'custom-oauth-text',
  },
  layout: {
    socialButtonsPlacement: 'bottom',     // or 'top'
    socialButtonsVariant: 'blockButton',  // or 'iconButton'
  },
}}
```

## Advanced Customization

### 1. Custom OAuth Providers
Configure in Clerk Dashboard and they'll automatically appear in the form.

### 2. Additional Styling Options

```tsx
appearance={{
  elements: {
    // ... existing styles
  },
  variables: {
    colorPrimary: 'hsl(var(--primary))',
    colorBackground: 'hsl(var(--background))',
    colorText: 'hsl(var(--foreground))',
    borderRadius: '0.5rem',
    fontFamily: 'var(--font-geist-sans)',
  },
}}
```

### 3. Loading State Customization

```tsx
<SignUp
  appearance={{
    elements: {
      spinner: 'border-primary',
      // ... other styles
    },
  }}
  // ... other props
/>
```

## Common Patterns

### Pattern 1: Center-Aligned Auth Pages
Best for dedicated auth flows (used in the template above).

### Pattern 2: Side-by-Side Layout
For marketing-heavy auth pages:

```tsx
<section className="min-h-screen grid lg:grid-cols-2">
  <div className="flex items-center justify-center p-8">
    <SignUp {...props} />
  </div>
  <div className="bg-muted flex items-center justify-center p-8">
    {/* Marketing content, testimonials, features */}
  </div>
</section>
```

### Pattern 3: Modal/Dialog Auth
For inline authentication flows:

```tsx
import { SignUp } from '@clerk/nextjs';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function SignUpModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <SignUp
          redirectUrl="/dashboard"
          appearance={{ /* ... */ }}
        />
      </DialogContent>
    </Dialog>
  );
}
```

## Testing Checklist

- [ ] Page loads without hydration errors
- [ ] Form is properly styled in light mode
- [ ] Form is properly styled in dark mode
- [ ] Form is properly styled in custom themes (e.g., OLED)
- [ ] OAuth buttons appear if configured
- [ ] Email verification flow works
- [ ] Redirect to dashboard after sign-up works
- [ ] "Sign in instead" link works
- [ ] Mobile responsive (test on 375px width)
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Error messages are styled correctly
- [ ] Loading states display properly

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Troubleshooting

### Issue: Hydration Mismatch
**Solution:** Use the `mounted` state pattern shown in the template.

### Issue: Styles Not Applying
**Solution:**
1. Check that CSS variables are defined in globals.css
2. Verify Tailwind is processing the auth page files
3. Use browser DevTools to inspect applied classes

### Issue: Redirect Not Working
**Solution:**
1. Check `redirectUrl` prop is set correctly
2. Verify middleware allows access to the redirect URL
3. Check Clerk Dashboard URL settings

### Issue: Dark Mode Not Working
**Solution:**
1. Ensure ThemeProvider wraps the app
2. Verify `suppressHydrationWarning` on `<html>` tag
3. Check CSS variables are defined for `.dark` class

## Integration with User Metadata

To add custom fields or user metadata during sign-up:

```tsx
// Use Clerk's user profile component instead
import { UserProfile } from '@clerk/nextjs';

// Or handle in a webhook after user creation
// See Clerk docs: https://clerk.com/docs/users/sync-data
```

## Security Best Practices

1. **Never expose secret keys** - Only `NEXT_PUBLIC_*` variables in client code
2. **Use HTTPS** in production for Clerk callbacks
3. **Configure allowed redirect URLs** in Clerk Dashboard
4. **Enable MFA** in Clerk Dashboard for enhanced security
5. **Set up webhooks** to sync user data securely to your database

## Related Skills

- **Clerk Sign-In Page** - Use the same pattern for sign-in
- **Protected Route Setup** - Configure middleware for auth
- **User Profile Management** - Implement settings pages
- **Role-Based Access Control** - Add authorization layers

## Quick Start Command

To implement this skill in a new project:

1. Install Clerk: `npm install @clerk/nextjs`
2. Set up environment variables
3. Create the file structure as shown
4. Copy the templates
5. Customize appearance to match your design system
6. Test the flow

## Example Projects

This pattern is used in:
- MCP Finance (NextJS SaaS with Clerk auth)
- [Add your own implementations here]

## Version History

- **v1.0** - Initial skill created from MCP Finance sign-up implementation
- Uses Clerk SDK version: `@clerk/nextjs@^5.0.0`
- Next.js version: `15.0.0+`

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Component Customization](https://clerk.com/docs/components/customization/overview)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
