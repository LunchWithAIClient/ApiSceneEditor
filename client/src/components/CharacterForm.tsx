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
import type { Character } from "@shared/api-types";

interface CharacterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: Character;
  onSave: (character: Partial<Character>) => void;
}

export default function CharacterForm({
  open,
  onOpenChange,
  character,
  onSave,
}: CharacterFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [motivation, setMotivation] = useState("");

  useEffect(() => {
    if (character) {
      setName(character.name);
      setDescription(character.description);
      setMotivation(character.motivation);
    } else {
      setName("");
      setDescription("");
      setMotivation("");
    }
  }, [character, open]);

  const handleSave = () => {
    onSave({
      ...(character?.character_id && { character_id: character.character_id }),
      name,
      description,
      motivation,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-character-form">
        <DialogHeader>
          <DialogTitle>
            {character ? "Edit Character" : "Add New Character"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character name"
              data-testid="input-character-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Character description"
              className="min-h-32"
              data-testid="input-character-description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivation">Motivation</Label>
            <Textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Character motivation"
              className="min-h-32"
              data-testid="input-character-motivation"
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
          <Button onClick={handleSave} data-testid="button-save-character">
            Save Character
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
