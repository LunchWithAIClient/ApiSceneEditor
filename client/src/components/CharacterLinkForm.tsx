import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Character } from "@shared/api-types";

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
  const [castId, setCastId] = useState("");
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const handleLink = () => {
    if (castId && selectedCharacterId) {
      onLink(castId, selectedCharacterId);
      setCastId("");
      setSelectedCharacterId("");
    }
  };

  const handleCancel = () => {
    setCastId("");
    setSelectedCharacterId("");
    onOpenChange(false);
  };

  const selectedCharacter = characters.find(c => c.character_id === selectedCharacterId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-character-link-form">
        <DialogHeader>
          <DialogTitle>Link Character to Cast</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="castId">Cast ID</Label>
            <Input
              id="castId"
              value={castId}
              onChange={(e) => setCastId(e.target.value)}
              placeholder="Enter cast ID"
              data-testid="input-cast-id"
            />
            <p className="text-xs text-muted-foreground">
              The cast ID from the scene you want to link to
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Character</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
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
                          value={character.character_id}
                          onSelect={() => {
                            setSelectedCharacterId(character.character_id);
                            setComboboxOpen(false);
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
                            <p className="text-xs text-muted-foreground font-mono">
                              {character.character_id}
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
              Select from existing characters or use their ID
            </p>
          </div>
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
            disabled={!castId || !selectedCharacterId}
            data-testid="button-link-character"
          >
            Link Character
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
