import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CharacterForm from "@/components/CharacterForm";
import { apiClient } from "@/lib/lunchWithApi";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/api-types";
import IdDisplay from "@/components/IdDisplay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CharacterDetail() {
  const [, params] = useRoute("/characters/:id");
  const [, setLocation] = useLocation();
  const [character, setCharacter] = useState<Character | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const characterId = params?.id || "";

  const loadCharacter = async () => {
    if (!characterId) return;
    
    try {
      setIsLoading(true);
      const data = await apiClient.getCharacter(characterId);
      setCharacter(data);
    } catch (error) {
      toast({
        title: "Error loading character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharacter();
  }, [characterId]);

  const handleBack = () => {
    setLocation("/characters");
  };

  const handleEdit = () => {
    setFormOpen(true);
  };

  const handleSave = async (characterData: Partial<Character>) => {
    try {
      if (characterData.character_id) {
        const { character_id, ...updateData } = characterData;
        await apiClient.updateCharacter(character_id, updateData);
        toast({
          title: "Character updated",
          description: "The character has been updated successfully.",
        });
        await loadCharacter();
      }
    } catch (error) {
      toast({
        title: "Error updating character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!character) return;

    try {
      await apiClient.deleteCharacter(character.character_id);
      toast({
        title: "Character deleted",
        description: "The character has been deleted successfully.",
      });
      setLocation("/characters");
    } catch (error) {
      toast({
        title: "Error deleting character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !character) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-2"
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Characters
        </Button>
        <h2 className="text-3xl font-bold">{character.name}</h2>
      </div>

      <div className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-base font-semibold">Character Information</h3>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEdit}
                      className="h-7 w-7"
                      data-testid="button-edit-character"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit character</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeleteClick}
                      className="h-7 w-7"
                      data-testid="button-delete-character"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete character</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <IdDisplay id={character.character_id} label="ID" testId="text-character-detail-id" />
              <div>
                <span className="text-muted-foreground">Description </span>
                <span className="text-foreground line-clamp-2">{character.description}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Motivation </span>
                <span className="text-foreground line-clamp-2">{character.motivation}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CharacterForm
        open={formOpen}
        onOpenChange={setFormOpen}
        character={character}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{character.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
