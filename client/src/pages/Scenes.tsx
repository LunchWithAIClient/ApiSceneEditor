import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import SceneCard from "@/components/SceneCard";
import SceneForm from "@/components/SceneForm";
import type { Scene } from "@shared/api-types";

export default function Scenes() {
  const [, setLocation] = useLocation();
  
  //todo: remove mock functionality
  const [scenes, setScenes] = useState<Scene[]>([
    {
      scene_id: "1",
      name: "The Detective's Office",
      description: "You are in an office with a desk covered with the sports page of the newspaper. There are two chairs on the other side of the desk and a filing cabinet in the corner. On top of the filing cabinet is an old coffee machine. If it wasn't raining so hard you would open a window. The rain should have cooled things down but it's still hot."
    },
    {
      scene_id: "2",
      name: "The Restaurant",
      description: "A dimly lit Italian restaurant with red checkered tablecloths. The smell of garlic and tomato sauce fills the air. In the corner, a piano player softly plays jazz standards."
    }
  ]);
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | undefined>();
  const [isLoading] = useState(false);

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

  const handleSave = (sceneData: Partial<Scene>) => {
    //todo: remove mock functionality
    if (sceneData.scene_id) {
      setScenes(prev => prev.map(s => 
        s.scene_id === sceneData.scene_id 
          ? { ...s, ...sceneData } as Scene
          : s
      ));
    } else {
      const newScene: Scene = {
        scene_id: `scene-${Date.now()}`,
        name: sceneData.name || "",
        description: sceneData.description || ""
      };
      setScenes(prev => [...prev, newScene]);
    }
  };

  const handleDelete = (sceneId: string) => {
    //todo: remove mock functionality
    if (confirm("Are you sure you want to delete this scene?")) {
      setScenes(prev => prev.filter(s => s.scene_id !== sceneId));
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
