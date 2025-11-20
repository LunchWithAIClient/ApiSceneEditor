import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Edit, Trash2, Copy, ChevronDown, Eye } from "lucide-react";
import type { Scene } from "@shared/api-types";
import IdDisplay from "@/components/IdDisplay";

interface SceneCardProps {
  scene: Scene;
  onView: (sceneId: string) => void;
  onEdit: (scene: Scene) => void;
  onDelete: (sceneId: string) => void;
  onDuplicate: (scene: Scene) => void;
}

export default function SceneCard({
  scene,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: SceneCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card data-testid={`card-scene-${scene.scene_id}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium mb-1" data-testid="text-scene-name">
              {scene.name}
            </h3>
            <IdDisplay id={scene.scene_id} testId="text-scene-id" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(scene.scene_id)}
              data-testid="button-view-scene"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDuplicate(scene)}
              data-testid="button-duplicate-scene"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(scene)}
              data-testid="button-edit-scene"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(scene.scene_id)}
              data-testid="button-delete-scene"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-toggle-scene"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-base">{scene.description}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
