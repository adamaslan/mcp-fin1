"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface KeyThemesCardProps {
  themes: string[];
}

export function KeyThemesCard({ themes }: KeyThemesCardProps) {
  return (
    <Card data-testid="key-themes-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Key Themes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {themes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No market themes identified
          </p>
        ) : (
          <ul className="space-y-2">
            {themes.map((theme, index) => (
              <li
                key={index}
                data-testid="key-theme"
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-blue-500 dark:text-blue-400 font-bold mt-0.5">
                  •
                </span>
                <span>{theme}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
