import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, Loader2, Link2, X } from "lucide-react";
import StartSceneSelector from "@/components/StartSceneSelector";
import CharacterLinkForm from "@/components/CharacterLinkForm";
import { apiClient } from "@/lib/lunchWithApi";
import { useToast } from "@/hooks/use-toast";
import type { Story, StoryCast, Character } from "@shared/api-types";

export default function StoryDetail() {
  const [, params] = useRoute("/stories/:id");
  const [, setLocation] = useLocation();
  const [story, setStory] = useState<Story | null>(null);
  const [castLinks, setCastLinks] = useState<StoryCast[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const { toast } = useToast();

  const storyId = params?.id || "";

  const loadStory = async () => {
    if (!storyId) return;
    
    try {
      const data = await apiClient.getStory(storyId);
      setStory(data);
    } catch (error) {
      toast({
        title: "Error loading story",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const loadCastLinks = async () => {
    if (!storyId) return;
    
    try {
      const data = await apiClient.getStoryCastLinks(storyId);
      setCastLinks(data);
    } catch (error) {
      // Don't show error for cast links as they might not exist yet
      setCastLinks([]);
    }
  };

  const loadCharacters = async () => {
    try {
      const data = await apiClient.getCharacters();
      setCharacters(data);
    } catch (error) {
      toast({
        title: "Error loading characters",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadStory(), loadCastLinks(), loadCharacters()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [storyId]);

  const handleBack = () => {
    setLocation("/stories");
  };

  const handleSetStartScene = async (sceneId: string) => {
    try {
      await apiClient.setStoryStartScene(storyId, sceneId);
      toast({
        title: "Start scene updated",
        description: "The start scene has been set successfully.",
      });
      await loadStory();
    } catch (error) {
      toast({
        title: "Error setting start scene",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleLinkCharacter = async (characterId: string, castId: string) => {
    try {
      await apiClient.linkCharacterToCast(storyId, characterId, castId);
      toast({
        title: "Character linked",
        description: "The character has been linked to the cast successfully.",
      });
      await loadCastLinks();
      setLinkFormOpen(false);
    } catch (error) {
      toast({
        title: "Error linking character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleUnlinkCharacter = async (castId: string) => {
    if (!confirm("Are you sure you want to unlink this character?")) {
      return;
    }

    try {
      await apiClient.unlinkCharacterFromCast(storyId, castId);
      toast({
        title: "Character unlinked",
        description: "The character has been unlinked successfully.",
      });
      await loadCastLinks();
    } catch (error) {
      toast({
        title: "Error unlinking character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const getCharacterName = (characterId: string): string => {
    const character = characters.find(c => c.character_id === characterId);
    return character?.name || "Unknown Character";
  };

  if (isLoading || !story) {
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
          Back to Stories
        </Button>
        <h2 className="text-3xl font-bold">{story.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Story Information</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  ID: <span className="text-xs font-mono">{story.story_id}</span>
                </p>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-base">{story.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Start Scene</h3>
            </CardHeader>
            <CardContent>
              <StartSceneSelector
                currentSceneId={story.start_scene_id}
                onSelect={handleSetStartScene}
              />
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Character Links</h3>
              <Button
                onClick={() => setLinkFormOpen(true)}
                data-testid="button-add-character-link"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Link Character
              </Button>
            </div>

            {castLinks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-base mb-2">No character links yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Link characters to cast members to bring your story to life
                  </p>
                  <Button onClick={() => setLinkFormOpen(true)}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Link Character
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {castLinks.map((link) => (
                  <Card key={link.cast_id} data-testid={`card-character-link-${link.cast_id}`}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="space-y-1">
                        <p className="font-medium">{getCharacterName(link.character_id)}</p>
                        <p className="text-sm text-muted-foreground">
                          Cast ID: <span className="font-mono text-xs">{link.cast_id}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Character ID: <span className="font-mono text-xs">{link.character_id}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnlinkCharacter(link.cast_id)}
                        data-testid="button-unlink-character"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Story Metadata</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Story ID</p>
                <p className="text-xs font-mono">{story.story_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Character Links</p>
                <p className="text-base">{castLinks.length} link{castLinks.length !== 1 ? 's' : ''}</p>
              </div>
              {story.start_scene_id && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start Scene ID</p>
                  <p className="text-xs font-mono break-all">{story.start_scene_id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CharacterLinkForm
        open={linkFormOpen}
        onOpenChange={setLinkFormOpen}
        characters={characters}
        onLink={handleLinkCharacter}
      />
    </div>
  );
}
