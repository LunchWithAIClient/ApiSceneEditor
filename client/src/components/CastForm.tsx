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
import type { Cast } from "@shared/api-types";

interface CastFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sceneId: string;
  cast?: Cast;
  onSave: (cast: Partial<Cast>) => void;
}

export default function CastForm({
  open,
  onOpenChange,
  sceneId,
  cast,
  onSave,
}: CastFormProps) {
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [start, setStart] = useState("");

  useEffect(() => {
    if (cast) {
      setRole(cast.role);
      setGoal(cast.goal);
      setStart(cast.start);
    } else {
      setRole("");
      setGoal("");
      setStart("");
    }
  }, [cast, open]);

  const handleSave = () => {
    onSave({
      ...(cast?.cast_id && { cast_id: cast.cast_id }),
      scene_id: sceneId,
      role,
      goal,
      start,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-cast-form">
        <DialogHeader>
          <DialogTitle>
            {cast ? "Edit Cast Member" : "Add Cast Member"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Detective, Client"
              data-testid="input-cast-role"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What does this character want to achieve?"
              className="min-h-32"
              data-testid="input-cast-goal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start">Start</Label>
            <Textarea
              id="start"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="How does this character enter the scene?"
              className="min-h-32"
              data-testid="input-cast-start"
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
          <Button onClick={handleSave} data-testid="button-save-cast">
            Save Cast Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
