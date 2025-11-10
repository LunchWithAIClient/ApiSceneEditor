import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import CharacterCard from "@/components/CharacterCard";
import CharacterForm from "@/components/CharacterForm";
import type { Character } from "@shared/api-types";

export default function Characters() {
  //todo: remove mock functionality
  const [characters, setCharacters] = useState<Character[]>([
    {
      character_id: "1",
      name: "Steve Lugar",
      description: "You are a Private Detective straight out of a classic film noir or detective novel. You have walked these mean streets for a decade and have learned how to ask good questions and observe people's behavior.",
      motivation: "You are down on your luck and willing to take any job that comes your way. No matter how much you need a job you won't tangle with the mob."
    },
    {
      character_id: "2",
      name: "Molly Chen",
      description: "A mysterious client who arrives on a rainy evening with a case that seems too dangerous to take on.",
      motivation: "Find out what happened to her missing sister before it's too late."
    }
  ]);
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [isLoading] = useState(false);

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCharacter(undefined);
    setFormOpen(true);
  };

  const handleSave = (characterData: Partial<Character>) => {
    //todo: remove mock functionality
    if (characterData.character_id) {
      setCharacters(prev => prev.map(c => 
        c.character_id === characterData.character_id 
          ? { ...c, ...characterData } as Character
          : c
      ));
    } else {
      const newCharacter: Character = {
        character_id: `char-${Date.now()}`,
        name: characterData.name || "",
        description: characterData.description || "",
        motivation: characterData.motivation || ""
      };
      setCharacters(prev => [...prev, newCharacter]);
    }
  };

  const handleDelete = (characterId: string) => {
    //todo: remove mock functionality
    if (confirm("Are you sure you want to delete this character?")) {
      setCharacters(prev => prev.filter(c => c.character_id !== characterId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Characters</h2>
        <Button onClick={handleAdd} data-testid="button-add-character">
          <Plus className="w-4 h-4 mr-2" />
          Add New Character
        </Button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-2">No characters yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first character to get started
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Character
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.character_id}
              character={character}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CharacterForm
        open={formOpen}
        onOpenChange={setFormOpen}
        character={editingCharacter}
        onSave={handleSave}
      />
    </div>
  );
}
