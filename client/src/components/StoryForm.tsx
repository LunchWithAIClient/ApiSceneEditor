import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/lunchWithApi";
import type { Story, Scene } from "@shared/api-types";

interface StoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story?: Story;
  onSave: (story: Partial<Story> & { start_scene_id?: string }) => void;
}

export default function StoryForm({
  open,
  onOpenChange,
  story,
  onSave,
}: StoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startSceneId, setStartSceneId] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);

  useEffect(() => {
    if (story) {
      setName(story.name);
      setDescription(story.description);
      setStartSceneId(story.start_scene_id || "");
    } else {
      setName("");
      setDescription("");
      setStartSceneId("");
    }
  }, [story, open]);

  useEffect(() => {
    if (open && !story) {
      // Only load scenes when creating a new story
      loadScenes();
    }
  }, [open, story]);

  const loadScenes = async () => {
    try {
      setIsLoadingScenes(true);
      const data = await apiClient.getScenes();
      setScenes(data);
    } catch (error) {
      console.error("Error loading scenes:", error);
      setScenes([]);
    } finally {
      setIsLoadingScenes(false);
    }
  };

  const handleSave = () => {
    const storyData: Partial<Story> & { start_scene_id?: string } = {
      ...(story?.story_id && { story_id: story.story_id }),
      name,
      description,
    };

    // Include start_scene_id for new stories
    if (!story && startSceneId) {
      storyData.start_scene_id = startSceneId;
    }

    onSave(storyData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-story-form">
        <DialogHeader>
          <DialogTitle>
            {story ? "Edit Story" : "Add New Story"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Story name"
              data-testid="input-story-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Story description"
              className="min-h-32"
              data-testid="input-story-description"
            />
          </div>
          
          {!story && (
            <div className="space-y-2">
              <Label htmlFor="start-scene">Start Scene (Required)</Label>
              {isLoadingScenes ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select value={startSceneId} onValueChange={setStartSceneId}>
                  <SelectTrigger id="start-scene" data-testid="select-start-scene-form">
                    <SelectValue placeholder="Select a start scene..." />
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
              )}
              <p className="text-xs text-muted-foreground">
                Every story must have a start scene
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!story && !startSceneId}
            data-testid="button-save-story"
          >
            Save Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
