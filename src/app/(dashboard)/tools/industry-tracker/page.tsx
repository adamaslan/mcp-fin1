"use client";

import { IndustryPerformers } from "@/components/landing/IndustryPerformers";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function IndustryTrackerPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="px-0">
        <h1 className="text-3xl font-bold">Industry Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Top 50 industries ranked by performance across multiple time horizons
        </p>
      </div>
      <IndustryPerformers />
    </div>
  );
}
