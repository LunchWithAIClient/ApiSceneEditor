import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/lunchWithApi";
import type { Character, Scene, Cast } from "@shared/api-types";

interface CastWithScene extends Cast {
  sceneName: string;
}

interface CharacterLinkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characters: Character[];
  onLink: (castId: string, characterId: string) => void;
}

export default function CharacterLinkForm({
  open,
  onOpenChange,
  characters,
  onLink,
}: CharacterLinkFormProps) {
  const [castMembers, setCastMembers] = useState<CastWithScene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCastId, setSelectedCastId] = useState("");
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [castComboboxOpen, setCastComboboxOpen] = useState(false);
  const [characterComboboxOpen, setCharacterComboboxOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadAllCastMembers();
    }
  }, [open]);

  const loadAllCastMembers = async () => {
    setIsLoading(true);
    try {
      // First, get all scenes
      const scenes = await apiClient.getScenes();
      
      // Then, for each scene, get its cast members
      const allCastPromises = scenes.map(async (scene: Scene) => {
        try {
          const cast = await apiClient.getCastMembers(scene.scene_id);
          return cast.map((c: Cast) => ({
            ...c,
            sceneName: scene.name,
          }));
        } catch {
          return [];
        }
      });

      const allCastArrays = await Promise.all(allCastPromises);
      const flatCast = allCastArrays.flat();
      setCastMembers(flatCast);
    } catch (error) {
      console.error("Error loading cast members:", error);
      setCastMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLink = () => {
    if (selectedCastId && selectedCharacterId) {
      onLink(selectedCastId, selectedCharacterId);
      setSelectedCastId("");
      setSelectedCharacterId("");
    }
  };

  const handleCancel = () => {
    setSelectedCastId("");
    setSelectedCharacterId("");
    onOpenChange(false);
  };

  const selectedCast = castMembers.find(c => c.cast_id === selectedCastId);
  const selectedCharacter = characters.find(c => c.character_id === selectedCharacterId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-character-link-form">
        <DialogHeader>
          <DialogTitle>Link Character to Cast</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Cast Member</Label>
                <Popover open={castComboboxOpen} onOpenChange={setCastComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={castComboboxOpen}
                      className="w-full justify-between"
                      data-testid="button-select-cast"
                      disabled={castMembers.length === 0}
                    >
                      {selectedCast
                        ? `${selectedCast.role} - ${selectedCast.sceneName}`
                        : castMembers.length === 0
                        ? "No cast members available"
                        : "Select cast member..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search cast members..." data-testid="input-search-cast" />
                      <CommandList>
                        <CommandEmpty>No cast member found.</CommandEmpty>
                        <CommandGroup>
                          {castMembers.map((cast) => (
                            <CommandItem
                              key={cast.cast_id}
                              value={`${cast.role} ${cast.sceneName} ${cast.cast_id}`}
                              onSelect={() => {
                                setSelectedCastId(cast.cast_id);
                                setCastComboboxOpen(false);
                              }}
                              data-testid={`option-cast-${cast.cast_id}`}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCastId === cast.cast_id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{cast.role}</p>
                                <p className="text-sm text-muted-foreground">Scene: {cast.sceneName}</p>
                                <p className="text-xs text-muted-foreground">Goal: {cast.goal}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Select a cast member from any scene
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Character</Label>
                <Popover open={characterComboboxOpen} onOpenChange={setCharacterComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={characterComboboxOpen}
                      className="w-full justify-between"
                      data-testid="button-select-character"
                    >
                      {selectedCharacter
                        ? selectedCharacter.name
                        : "Select character..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search characters..." data-testid="input-search-character" />
                      <CommandList>
                        <CommandEmpty>No character found.</CommandEmpty>
                        <CommandGroup>
                          {characters.map((character) => (
                            <CommandItem
                              key={character.character_id}
                              value={`${character.name} ${character.character_id}`}
                              onSelect={() => {
                                setSelectedCharacterId(character.character_id);
                                setCharacterComboboxOpen(false);
                              }}
                              data-testid={`option-character-${character.character_id}`}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCharacterId === character.character_id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div>
                                <p className="font-medium">{character.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {character.description.substring(0, 60)}
                                  {character.description.length > 60 ? "..." : ""}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Select the character to play this cast member
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={!selectedCastId || !selectedCharacterId || isLoading}
            data-testid="button-link-character"
          >
            Link Character
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
