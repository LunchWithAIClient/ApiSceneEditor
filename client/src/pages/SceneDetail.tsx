import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, Plus, Loader2 } from "lucide-react";
import CastItem from "@/components/CastItem";
import CastForm from "@/components/CastForm";
import { apiClient } from "@/lib/lunchWithApi";
import { useToast } from "@/hooks/use-toast";
import type { Scene, Cast } from "@shared/api-types";
import IdDisplay from "@/components/IdDisplay";

export default function SceneDetail() {
  const [, params] = useRoute("/scenes/:id");
  const [, setLocation] = useLocation();
  const [scene, setScene] = useState<Scene | null>(null);
  const [castMembers, setCastMembers] = useState<Cast[]>([]);
  const [castFormOpen, setCastFormOpen] = useState(false);
  const [editingCast, setEditingCast] = useState<Cast | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const sceneId = params?.id || "";

  const loadScene = async () => {
    if (!sceneId) return;
    
    try {
      const data = await apiClient.getScene(sceneId);
      setScene(data);
    } catch (error) {
      toast({
        title: "Error loading scene",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const loadCastMembers = async () => {
    if (!sceneId) return;
    
    try {
      const data = await apiClient.getCastMembers(sceneId);
      setCastMembers(data);
    } catch (error) {
      toast({
        title: "Error loading cast members",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadScene(), loadCastMembers()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [sceneId]);

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

  const handleSaveCast = async (castData: Partial<Cast>) => {
    try {
      if (castData.cast_id) {
        // Exclude cast_id and scene_id from the body as they should only be in the URL
        const { cast_id, scene_id, ...updateData } = castData;
        await apiClient.updateCast(sceneId, cast_id, updateData);
        toast({
          title: "Cast member updated",
          description: "The cast member has been updated successfully.",
        });
      } else {
        await apiClient.createCast(sceneId, {
          scene_id: sceneId,
          role: castData.role || "",
          goal: castData.goal || "",
          start: castData.start || "",
        });
        toast({
          title: "Cast member created",
          description: "The cast member has been created successfully.",
        });
      }
      await loadCastMembers();
    } catch (error) {
      toast({
        title: "Error saving cast member",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCast = async (castId: string) => {
    if (!confirm("Are you sure you want to delete this cast member?")) {
      return;
    }

    try {
      await apiClient.deleteCast(sceneId, castId);
      toast({
        title: "Cast member deleted",
        description: "The cast member has been deleted successfully.",
      });
      await loadCastMembers();
    } catch (error) {
      toast({
        title: "Error deleting cast member",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !scene) {
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

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Scene Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <IdDisplay id={scene.scene_id} testId="text-scene-detail-id" />
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-base">{scene.description}</p>
              </div>
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
