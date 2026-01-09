interface BlurredContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function BlurredContent({ children, fallback }: BlurredContentProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-background/80 to-background backdrop-blur-sm rounded-lg">
        {fallback || (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Content locked</p>
          </div>
        )}
      </div>
    </div>
  );
}
