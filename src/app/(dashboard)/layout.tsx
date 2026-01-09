import { ClerkLoaded, ClerkLoading, UserButton } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 border-r bg-muted/40">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Header />
            <div className="flex items-center gap-4">
              <ClerkLoading>
                <Skeleton className="h-10 w-10 rounded-full" />
              </ClerkLoading>
              <ClerkLoaded>
                <UserButton afterSignOutUrl="/" />
              </ClerkLoaded>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
