import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Scene } from "@shared/api-types";

interface SceneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scene?: Scene;
  onSave: (scene: Partial<Scene>) => void;
}

export default function SceneForm({
  open,
  onOpenChange,
  scene,
  onSave,
}: SceneFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (scene) {
      setName(scene.name);
      setDescription(scene.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [scene, open]);

  const handleSave = () => {
    onSave({
      ...(scene?.scene_id && { scene_id: scene.scene_id }),
      name,
      description,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-scene-form">
        <DialogHeader>
          <DialogTitle>
            {scene ? "Edit Scene" : "Add New Scene"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Scene name"
              data-testid="input-scene-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scene description"
              className="min-h-32"
              data-testid="input-scene-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-scene">
            Save Scene
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
