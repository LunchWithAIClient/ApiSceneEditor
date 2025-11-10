import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, Plus, Loader2 } from "lucide-react";
import CastItem from "@/components/CastItem";
import CastForm from "@/components/CastForm";
import type { Scene, Cast } from "@shared/api-types";

export default function SceneDetail() {
  const [, params] = useRoute("/scenes/:id");
  const [, setLocation] = useLocation();
  
  //todo: remove mock functionality
  const [scene] = useState<Scene>({
    scene_id: params?.id || "1",
    name: "The Detective's Office",
    description: "You are in an office with a desk covered with the sports page of the newspaper. There are two chairs on the other side of the desk and a filing cabinet in the corner. On top of the filing cabinet is an old coffee machine. If it wasn't raining so hard you would open a window. The rain should have cooled things down but it's still hot."
  });

  const [castMembers, setCastMembers] = useState<Cast[]>([
    {
      cast_id: "1",
      scene_id: scene.scene_id,
      role: "Detective",
      goal: "Solve the mystery and get paid.",
      start: "The detective sits behind his desk, feet up, reading the sports page."
    },
    {
      cast_id: "2",
      scene_id: scene.scene_id,
      role: "Client",
      goal: "Convince the detective to take the case.",
      start: "A woman in a rain-soaked coat enters through the door, hesitating in the doorway."
    }
  ]);

  const [castFormOpen, setCastFormOpen] = useState(false);
  const [editingCast, setEditingCast] = useState<Cast | undefined>();
  const [isLoading] = useState(false);

  const handleBack = () => {
    setLocation("/scenes");
  };

  const handleAddCast = () => {
    setEditingCast(undefined);
    setCastFormOpen(true);
  };

  const handleEditCast = (cast: Cast) => {
    setEditingCast(cast);
    setCastFormOpen(true);
  };

  const handleSaveCast = (castData: Partial<Cast>) => {
    //todo: remove mock functionality
    if (castData.cast_id) {
      setCastMembers(prev => prev.map(c => 
        c.cast_id === castData.cast_id 
          ? { ...c, ...castData } as Cast
          : c
      ));
    } else {
      const newCast: Cast = {
        cast_id: `cast-${Date.now()}`,
        scene_id: scene.scene_id,
        role: castData.role || "",
        goal: castData.goal || "",
        start: castData.start || ""
      };
      setCastMembers(prev => [...prev, newCast]);
    }
  };

  const handleDeleteCast = (castId: string) => {
    //todo: remove mock functionality
    if (confirm("Are you sure you want to delete this cast member?")) {
      setCastMembers(prev => prev.filter(c => c.cast_id !== castId));
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
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-2"
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Scenes
        </Button>
        <h2 className="text-3xl font-bold">{scene.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Scene Information</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-base">{scene.description}</p>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Cast Members</h3>
              <Button onClick={handleAddCast} data-testid="button-add-cast">
                <Plus className="w-4 h-4 mr-2" />
                Add Cast Member
              </Button>
            </div>

            {castMembers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-base mb-2">No cast members yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add cast members to bring this scene to life
                  </p>
                  <Button onClick={handleAddCast}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cast Member
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {castMembers.map((cast) => (
                  <CastItem
                    key={cast.cast_id}
                    cast={cast}
                    onEdit={handleEditCast}
                    onDelete={handleDeleteCast}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Scene Metadata</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Scene ID</p>
                <p className="text-xs font-mono">{scene.scene_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cast Count</p>
                <p className="text-base">{castMembers.length} member{castMembers.length !== 1 ? 's' : ''}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CastForm
        open={castFormOpen}
        onOpenChange={setCastFormOpen}
        sceneId={scene.scene_id}
        cast={editingCast}
        onSave={handleSaveCast}
      />
    </div>
  );
}
