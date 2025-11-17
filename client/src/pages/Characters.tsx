import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Search } from "lucide-react";
import CharacterCard from "@/components/CharacterCard";
import CharacterForm from "@/components/CharacterForm";
import { apiClient } from "@/lib/lunchWithApi";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/api-types";

export default function Characters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return characters;
    
    const query = searchQuery.toLowerCase();
    return characters.filter(
      (char) =>
        char.name.toLowerCase().includes(query) ||
        char.character_id.toLowerCase().includes(query)
    );
  }, [characters, searchQuery]);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getCharacters();
      setCharacters(data);
    } catch (error) {
      toast({
        title: "Error loading characters",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCharacter(undefined);
    setFormOpen(true);
  };

  const handleSave = async (characterData: Partial<Character>) => {
    try {
      if (characterData.character_id) {
        // Exclude character_id from the body as it should only be in the URL
        const { character_id, ...updateData } = characterData;
        await apiClient.updateCharacter(character_id, updateData);
        toast({
          title: "Character updated",
          description: "The character has been updated successfully.",
        });
      } else {
        await apiClient.createCharacter({
          name: characterData.name || "",
          description: characterData.description || "",
          motivation: characterData.motivation || "",
        });
        toast({
          title: "Character created",
          description: "The character has been created successfully.",
        });
      }
      await loadCharacters();
    } catch (error) {
      toast({
        title: "Error saving character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (characterId: string) => {
    if (!confirm("Are you sure you want to delete this character?")) {
      return;
    }

    try {
      await apiClient.deleteCharacter(characterId);
      toast({
        title: "Character deleted",
        description: "The character has been deleted successfully.",
      });
      await loadCharacters();
    } catch (error) {
      toast({
        title: "Error deleting character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (character: Character) => {
    try {
      // Create a copy with only the fields allowed by InsertCharacter
      await apiClient.createCharacter({
        name: `${character.name} (Copy)`,
        description: character.description,
        motivation: character.motivation,
      });
      toast({
        title: "Character duplicated",
        description: "The character has been duplicated successfully.",
      });
      await loadCharacters();
    } catch (error) {
      toast({
        title: "Error duplicating character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
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
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-characters"
            />
          </div>

          {filteredCharacters.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-medium mb-2">No characters found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCharacters.map((character) => (
                <CharacterCard
                  key={character.character_id}
                  character={character}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}
        </>
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
