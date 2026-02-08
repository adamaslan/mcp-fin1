"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";

interface Preset {
  id: string;
  name: string;
  description?: string;
  toolName: string;
  parameters: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
}

interface PresetSelectorProps {
  toolName: string;
  onLoadPreset: (parameters: Record<string, any>) => void;
  tier?: string;
}

export function PresetSelector({
  toolName,
  onLoadPreset,
  tier,
}: PresetSelectorProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch presets for current tool
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/gcloud/presets");

        if (!response.ok) {
          throw new Error("Failed to fetch presets");
        }

        const data = await response.json();
        const toolPresets = (data.presets || []).filter(
          (p: Preset) => p.toolName === toolName,
        );

        setPresets(toolPresets);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Failed to fetch presets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, [toolName]);

  const handleLoadPreset = (preset: Preset) => {
    onLoadPreset(preset.parameters);
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      setDeleting(presetId);

      const response = await fetch("/api/gcloud/presets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete preset");
      }

      setPresets((prev) => prev.filter((p) => p.id !== presetId));
    } catch (err) {
      console.error("Failed to delete preset:", err);
      setError(err instanceof Error ? err.message : "Failed to delete preset");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
        {error}
      </div>
    );
  }

  if (presets.length === 0) {
    return (
      <div className="text-center py-4 text-xs text-muted-foreground">
        <p>No presets for this tool</p>
        <p className="text-xs mt-1">
          Configure parameters and save as a preset
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {presets.map((preset) => (
        <div
          key={preset.id}
          className="flex items-start gap-2 p-2 border rounded-lg hover:bg-accent transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{preset.name}</h4>
              {preset.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
            </div>
            {preset.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {preset.description}
              </p>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => handleLoadPreset(preset)}
            >
              Load
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => handleDeletePreset(preset.id)}
              disabled={deleting === preset.id}
            >
              {deleting === preset.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
