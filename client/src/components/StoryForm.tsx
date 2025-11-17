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
import type { Story } from "@shared/api-types";

interface StoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story?: Story;
  onSave: (story: Partial<Story>) => void;
}

export default function StoryForm({
  open,
  onOpenChange,
  story,
  onSave,
}: StoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (story) {
      setName(story.name);
      setDescription(story.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [story, open]);

  const handleSave = () => {
    onSave({
      ...(story?.story_id && { story_id: story.story_id }),
      name,
      description,
    });
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
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-story">
            Save Story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
