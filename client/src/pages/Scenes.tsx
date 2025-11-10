import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import SceneCard from "@/components/SceneCard";
import SceneForm from "@/components/SceneForm";
import { apiClient } from "@/lib/lunchWithApi";
import { useToast } from "@/hooks/use-toast";
import type { Scene } from "@shared/api-types";

export default function Scenes() {
  const [, setLocation] = useLocation();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadScenes = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getScenes();
      setScenes(data);
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

  useEffect(() => {
    loadScenes();
  }, []);

  const handleView = (sceneId: string) => {
    setLocation(`/scenes/${sceneId}`);
  };

  const handleEdit = (scene: Scene) => {
    setEditingScene(scene);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingScene(undefined);
    setFormOpen(true);
  };

  const handleSave = async (sceneData: Partial<Scene>) => {
    try {
      if (sceneData.scene_id) {
        await apiClient.updateScene(sceneData.scene_id, sceneData);
        toast({
          title: "Scene updated",
          description: "The scene has been updated successfully.",
        });
      } else {
        await apiClient.createScene({
          name: sceneData.name || "",
          description: sceneData.description || "",
        });
        toast({
          title: "Scene created",
          description: "The scene has been created successfully.",
        });
      }
      await loadScenes();
    } catch (error) {
      toast({
        title: "Error saving scene",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

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
      await loadScenes();
    } catch (error) {
      toast({
        title: "Error deleting scene",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenes.map((scene) => (
            <SceneCard
              key={scene.scene_id}
              scene={scene}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
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
