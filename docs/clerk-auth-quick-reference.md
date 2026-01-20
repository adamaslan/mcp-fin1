# Quick Reference: Clerk Auth Pages for Next.js

## TL;DR - Copy This Template

### Sign-Up Page (`src/app/(marketing)/sign-up/page.tsx`)

```tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">Start your journey today</p>
        </div>
        <SignUp
          redirectUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card border border-border rounded-lg shadow-sm",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-10 text-sm font-medium",
              formFieldInput:
                "bg-input border border-input rounded-md h-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background",
              footerActionLink:
                "text-primary hover:text-primary/90 hover:underline",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-sm",
              formFieldLabel: "text-sm font-medium text-foreground",
            },
          }}
        />
      </div>
    </section>
  );
}
```

### Sign-In Page (`src/app/(marketing)/sign-in/page.tsx`)

```tsx
"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <SignIn
          redirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card border border-border rounded-lg shadow-sm",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-10 text-sm font-medium",
              formFieldInput:
                "bg-input border border-input rounded-md h-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background",
              footerActionLink:
                "text-primary hover:text-primary/90 hover:underline",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-sm",
              formFieldLabel: "text-sm font-medium text-foreground",
            },
          }}
        />
      </div>
    </section>
  );
}
```

## Prerequisites Checklist

- [ ] `npm install @clerk/nextjs`
- [ ] ClerkProvider in root layout
- [ ] Environment variables set (see below)
- [ ] Middleware configured (see below)
- [ ] Tailwind CSS variables defined

## Environment Variables (`.env.local`)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Middleware (`src/middleware.ts`)

```tsx
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Root Layout (`src/app/layout.tsx`)

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

## Marketing Layout (`src/app/(marketing)/layout.tsx`)

```tsx
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            App Name
          </Link>

          <div className="flex items-center gap-4">
            <SignedOut>
              <Button asChild variant="outline">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
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
    </div>
  );
}
```

## Appearance Customization Map

| Element             | Purpose          | Example Classes                                          |
| ------------------- | ---------------- | -------------------------------------------------------- |
| `rootBox`           | Outer container  | `w-full`                                                 |
| `card`              | Form container   | `bg-card border rounded-lg shadow-sm`                    |
| `formButtonPrimary` | Submit button    | `bg-primary text-primary-foreground hover:bg-primary/90` |
| `formFieldInput`    | Input fields     | `bg-input border rounded-md h-9 focus:ring-2`            |
| `formFieldLabel`    | Input labels     | `text-sm font-medium`                                    |
| `footerActionLink`  | Navigation links | `text-primary hover:underline`                           |
| `dividerLine`       | OAuth separator  | `bg-border`                                              |
| `dividerText`       | "or" text        | `text-muted-foreground text-sm`                          |

## Common Modifications

### Change Heading Text

```tsx
<h1 className="text-3xl font-bold">Your Custom Title</h1>
<p className="text-muted-foreground mt-2">Your custom description</p>
```

### Change Background

```tsx
// Simple background
className = "min-h-screen ... bg-muted/50";

// Gradient background
className = "min-h-screen ... bg-gradient-to-b from-background to-muted/30";

// No background
className = "min-h-screen ... bg-transparent";
```

### Add Logo Above Form

```tsx
<div className="text-center mb-8">
  <Image
    src="/logo.svg"
    alt="Logo"
    width={48}
    height={48}
    className="mx-auto mb-4"
  />
  <h1 className="text-3xl font-bold">Create your account</h1>
  {/* ... */}
</div>
```

### Side-by-Side Layout

```tsx
<section className="min-h-screen grid lg:grid-cols-2">
  <div className="flex items-center justify-center p-8">
    <div className="w-full max-w-md">{/* Sign-up component */}</div>
  </div>
  <div className="bg-muted flex items-center justify-center p-8">
    {/* Marketing content */}
  </div>
</section>
```

## Troubleshooting

| Problem               | Solution                                        |
| --------------------- | ----------------------------------------------- |
| Hydration error       | Add `mounted` state and early return            |
| Styles not applying   | Check CSS variables in `globals.css`            |
| Dark mode broken      | Add `suppressHydrationWarning` to `<html>`      |
| Redirect fails        | Verify `redirectUrl` prop and middleware config |
| OAuth buttons missing | Configure in Clerk Dashboard                    |

## Testing Checklist

- [ ] Page loads without errors
- [ ] Light mode styling correct
- [ ] Dark mode styling correct
- [ ] Mobile responsive (test at 375px)
- [ ] Sign-up flow completes
- [ ] Redirects to dashboard after sign-up
- [ ] "Sign in instead" link works
- [ ] Email verification works
- [ ] Error messages display correctly

## Pro Tips

1. **Always use the `mounted` state** to prevent hydration errors with theming
2. **Match input heights** to your existing form components (usually `h-9` or `h-10`)
3. **Use CSS variables** (`hsl(var(--primary))`) for dynamic theming
4. **Test dark mode first** - it often reveals styling issues
5. **Keep appearance prop consistent** across sign-in/sign-up pages
6. **Use layout groups** `(marketing)` to share header/footer easily

## One-Command Setup

```bash
# Create directory structure
mkdir -p src/app/\(marketing\)/{sign-up,sign-in}

# Install dependencies
npm install @clerk/nextjs next-themes

# Copy templates (use the templates above)
```

## Example Implementation Time

- **Setup (first time):** ~30 minutes
- **Sign-up page:** ~5 minutes
- **Sign-in page:** ~3 minutes (copy + modify)
- **Testing:** ~10 minutes
- **Total:** ~45 minutes for complete auth flow
