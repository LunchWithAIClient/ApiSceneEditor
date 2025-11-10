import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Character } from "@shared/api-types";

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
}

export default function CharacterCard({
  character,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-character-${character.character_id}`}>
      <CardHeader className="pb-2">
        <h3 className="text-lg font-medium" data-testid="text-character-name">
          {character.name}
        </h3>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Description</p>
          <p className="text-base line-clamp-3">{character.description}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Motivation</p>
          <p className="text-base line-clamp-2">{character.motivation}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
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
      </CardFooter>
    </Card>
  );
}
