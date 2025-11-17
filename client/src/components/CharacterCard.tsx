import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Edit, Trash2, Copy, ChevronDown } from "lucide-react";
import type { Character } from "@shared/api-types";

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
  onDuplicate: (character: Character) => void;
}

export default function CharacterCard({
  character,
  onEdit,
  onDelete,
  onDuplicate,
}: CharacterCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card data-testid={`card-character-${character.character_id}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium mb-1" data-testid="text-character-name">
              {character.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono" data-testid="text-character-id">
              ID: {character.character_id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDuplicate(character)}
              data-testid="button-duplicate-character"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(character)}
              data-testid="button-edit-character"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(character.character_id)}
              data-testid="button-delete-character"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-toggle-character"
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
          <CardContent className="space-y-3 pt-0">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-base">{character.description}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Motivation</p>
              <p className="text-base">{character.motivation}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
