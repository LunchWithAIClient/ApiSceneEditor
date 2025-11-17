import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/lunchWithApi";
import type { Scene } from "@shared/api-types";

interface StartSceneSelectorProps {
  currentSceneId?: string;
  onSelect: (sceneId: string) => void;
}

export default function StartSceneSelector({
  currentSceneId,
  onSelect,
}: StartSceneSelectorProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(currentSceneId || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScenes = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getScenes();
        setScenes(data);
      } catch (error) {
        console.error("Error loading scenes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadScenes();
  }, []);

  useEffect(() => {
    setSelectedSceneId(currentSceneId || "");
  }, [currentSceneId]);

  const handleApply = () => {
    if (selectedSceneId) {
      onSelect(selectedSceneId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentSceneId && (
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Current Start Scene</p>
          <p className="font-mono text-xs">{currentSceneId}</p>
        </div>
      )}
      
      <div className="flex gap-4">
        <Select
          value={selectedSceneId}
          onValueChange={setSelectedSceneId}
        >
          <SelectTrigger className="flex-1" data-testid="select-start-scene">
            <SelectValue placeholder="Select a scene..." />
          </SelectTrigger>
          <SelectContent>
            {scenes.map((scene) => (
              <SelectItem
                key={scene.scene_id}
                value={scene.scene_id}
                data-testid={`option-scene-${scene.scene_id}`}
              >
                {scene.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleApply}
          disabled={!selectedSceneId || selectedSceneId === currentSceneId}
          data-testid="button-set-start-scene"
        >
          Set Start Scene
        </Button>
      </div>
    </div>
  );
}
