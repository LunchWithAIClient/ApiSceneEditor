import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Scene } from "@shared/api-types";

interface SceneCardProps {
  scene: Scene;
  onView: (sceneId: string) => void;
  onEdit: (scene: Scene) => void;
  onDelete: (sceneId: string) => void;
}

export default function SceneCard({
  scene,
  onView,
  onEdit,
  onDelete,
}: SceneCardProps) {
  return (
    <Card 
      className="hover-elevate cursor-pointer" 
      onClick={() => onView(scene.scene_id)}
      data-testid={`card-scene-${scene.scene_id}`}
    >
      <CardHeader className="pb-2">
        <h3 className="text-lg font-medium" data-testid="text-scene-name">
          {scene.name}
        </h3>
        <p className="text-sm text-muted-foreground" data-testid="text-scene-id">
          ID: {scene.scene_id}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-base line-clamp-3">{scene.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onView(scene.scene_id);
          }}
          data-testid="button-view-scene"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(scene);
          }}
          data-testid="button-edit-scene"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(scene.scene_id);
          }}
          data-testid="button-delete-scene"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
