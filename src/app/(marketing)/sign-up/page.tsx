"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignUpPage() {
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
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Start analyzing markets today
          </p>
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
