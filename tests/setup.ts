import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test-user-123" }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: "test-user-123",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    },
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: { id: "test-user-123" },
  }),
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
