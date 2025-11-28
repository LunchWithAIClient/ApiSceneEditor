/**
 * Scenes Page Component
 * 
 * Displays a grid of all scenes with search and CRUD functionality.
 * Features:
 * - Search across scene fields (name, ID, description)
 * - Create, edit, and delete scenes
 * - Duplicate existing scenes
 * - View scene details and cast members
 * - Display cast member count for each scene
 * - Empty state when no scenes exist
 * - Loading state while fetching data
 */

import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Search } from "lucide-react";
import SceneCard from "@/components/SceneCard";
import SceneForm from "@/components/SceneForm";
import { apiClient } from "@/lib/lunchWithApi";
import { useToast } from "@/hooks/use-toast";
import type { Scene } from "@shared/api-types";

export default function Scenes() {
  const [, setLocation] = useLocation();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [castMembersByScene, setCastMembersByScene] = useState<Record<string, any[]>>({}); // Cache of cast arrays keyed by scene_id
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | undefined>(); // undefined = creating new scene
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  /**
   * Memoized filtered scenes based on search query
   * Searches across: name, scene_id, and description fields
   * Uses nullish coalescing (??) to safely handle null/undefined values
   * Returns all scenes when search query is empty
   */
  const filteredScenes = useMemo(() => {
    if (!searchQuery.trim()) return scenes;
    
    const query = searchQuery.toLowerCase();
    return scenes.filter(
      (scene) =>
        (scene.name ?? "").toLowerCase().includes(query) ||
        (scene.scene_id ?? "").toLowerCase().includes(query) ||
        (scene.description ?? "").toLowerCase().includes(query)
    );
  }, [scenes, searchQuery]);

  /**
   * Loads all scenes from the API and fetches cast members for each scene
   * Filters out deleted scenes and deleted cast members
   * Uses Promise.all to fetch cast members in parallel for better performance
   * Gracefully handles errors for individual cast member fetches
   */
  const loadScenes = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getScenes();
      // Filter out deleted scenes
      const activeScenes = data.filter((scene) => !scene.deleted);
      setScenes(activeScenes);
      
      // Fetch cast members for all scenes in parallel
      const castData: Record<string, any[]> = {};
      await Promise.all(
        activeScenes.map(async (scene) => {
          try {
            const cast = await apiClient.getCastMembers(scene.scene_id);
            // Filter out deleted cast members
            castData[scene.scene_id] = cast.filter((c: any) => !c.deleted);
          } catch (error) {
            // If fetching cast fails for a scene, set empty array
            castData[scene.scene_id] = [];
          }
        })
      );
      setCastMembersByScene(castData);
    } catch (error) {
      toast({
        title: "Error loading scenes",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load scenes on component mount
  useEffect(() => {
    loadScenes();
  }, []);

  /**
   * Navigates to the scene detail page
   * @param sceneId - ID of the scene to view
   */
  const handleView = (sceneId: string) => {
    setLocation(`/scenes/${sceneId}`);
  };

  /**
   * Opens the scene form in edit mode with the selected scene
   */
  const handleEdit = (scene: Scene) => {
    setEditingScene(scene);
    setFormOpen(true);
  };

  /**
   * Opens the scene form in create mode (no scene selected)
   */
  const handleAdd = () => {
    setEditingScene(undefined);
    setFormOpen(true);
  };

  /**
   * Saves a scene (create or update based on presence of scene_id)
   * @param sceneData - Partial scene data from the form
   */
  const handleSave = async (sceneData: Partial<Scene>) => {
    try {
      if (sceneData.scene_id) {
        // Update existing scene
        // Exclude scene_id from the body as it should only be in the URL
        const { scene_id, ...updateData } = sceneData;
        await apiClient.updateScene(scene_id, updateData);
        toast({
          title: "Scene updated",
          description: "The scene has been updated successfully.",
        });
      } else {
        // Create new scene
        await apiClient.createScene({
          name: sceneData.name || "",
          description: sceneData.description || "",
        });
        toast({
          title: "Scene created",
          description: "The scene has been created successfully.",
        });
      }
      // Reload scenes to show the updated list
      await loadScenes();
    } catch (error) {
      toast({
        title: "Error saving scene",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  /**
   * Deletes a scene after confirmation
   * @param sceneId - ID of the scene to delete
   */
  const handleDelete = async (sceneId: string) => {
    if (!confirm("Are you sure you want to delete this scene?")) {
      return;
    }

    try {
      await apiClient.deleteScene(sceneId);
      toast({
        title: "Scene deleted",
        description: "The scene has been deleted successfully.",
      });
      // Reload scenes to show the updated list
      await loadScenes();
    } catch (error) {
      toast({
        title: "Error deleting scene",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  /**
   * Creates a duplicate of an existing scene with " (Copy)" appended to the name
   * Note: Does not duplicate cast members, only the scene itself
   * @param scene - The scene to duplicate
   */
  const handleDuplicate = async (scene: Scene) => {
    try {
      // Create a copy with only the fields allowed by InsertScene
      await apiClient.createScene({
        name: `${scene.name} (Copy)`,
        description: scene.description,
      });
      toast({
        title: "Scene duplicated",
        description: "The scene has been duplicated successfully.",
      });
      // Reload scenes to show the new duplicate
      await loadScenes();
    } catch (error) {
      toast({
        title: "Error duplicating scene",
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
        <h2 className="text-3xl font-bold">Scenes</h2>
        <Button onClick={handleAdd} data-testid="button-add-scene">
          <Plus className="w-4 h-4 mr-2" />
          Add New Scene
        </Button>
      </div>

      {scenes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-2">No scenes yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first scene to get started
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Scene
          </Button>
        </div>
      ) : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by any keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-scenes"
            />
          </div>

          {filteredScenes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-medium mb-2">No scenes found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredScenes.map((scene) => (
                <SceneCard
                  key={scene.scene_id}
                  scene={scene}
                  castMembers={castMembersByScene[scene.scene_id] || []}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </>
      )}

      <SceneForm
        open={formOpen}
        onOpenChange={setFormOpen}
        scene={editingScene}
        onSave={handleSave}
      />
    </div>
  );
}
