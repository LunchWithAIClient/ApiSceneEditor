/**
 * Scene Detail Page Component
 * 
 * Displays detailed information about a single scene and manages its cast members.
 * Features:
 * - View and edit scene information (name, description)
 * - Delete scene with confirmation dialog
 * - Manage cast members: create, edit, delete, search
 * - Search across cast member fields (role, goal, start)
 * - Full information dialog for scene details
 * - Icon-based actions with tooltips for better UX
 * - Loading and empty states
 * 
 * This is the most complex page with multiple dialogs and state management:
 * - Scene edit form
 * - Cast member edit form
 * - Scene deletion confirmation
 * - Cast member deletion confirmation
 * - Full scene information viewer
 */

import { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Plus, Loader2, Edit, Trash2, Eye, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CastItem from "@/components/CastItem";
import CastForm from "@/components/CastForm";
import SceneForm from "@/components/SceneForm";
import { apiClient } from "@/lib/lunchWithApi";
import { useToast } from "@/hooks/use-toast";
import type { Scene, Cast } from "@shared/api-types";
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

export default function SceneDetail() {
  const [, params] = useRoute("/scenes/:id");
  const [, setLocation] = useLocation();
  
  // Data state
  const [scene, setScene] = useState<Scene | null>(null);
  const [castMembers, setCastMembers] = useState<Cast[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Multiple dialogs requiring separate state for each
  const [castFormOpen, setCastFormOpen] = useState(false);
  const [sceneFormOpen, setSceneFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCastDialogOpen, setDeleteCastDialogOpen] = useState(false);
  const [deletingCastId, setDeletingCastId] = useState<string | null>(null);
  const [showFullInfo, setShowFullInfo] = useState(false);
  
  const [editingCast, setEditingCast] = useState<Cast | undefined>(); // undefined = creating new cast member
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const sceneId = params?.id || "";

  /**
   * Memoized filtered cast members based on search query
   * Searches across: role, goal, and start fields
   * Uses nullish coalescing (??) to safely handle null/undefined values
   * Returns all cast members when search query is empty
   */
  const filteredCastMembers = useMemo(() => {
    if (!searchQuery.trim()) return castMembers;
    
    const query = searchQuery.toLowerCase();
    return castMembers.filter(
      (cast) =>
        (cast.role ?? "").toLowerCase().includes(query) ||
        (cast.goal ?? "").toLowerCase().includes(query) ||
        (cast.start ?? "").toLowerCase().includes(query)
    );
  }, [castMembers, searchQuery]);

  /**
   * Loads scene data from the API
   * Only executes if sceneId is present
   */
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

  /**
   * Loads cast members for this scene from the API
   * Only executes if sceneId is present
   */
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

  /**
   * Loads both scene and cast member data in parallel
   * Sets loading state during fetch
   */
  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadScene(), loadCastMembers()]);
    setIsLoading(false);
  };

  // Load data when component mounts or sceneId changes
  useEffect(() => {
    loadData();
  }, [sceneId]);

  const handleBack = () => {
    setLocation("/scenes");
  };

  const handleEditScene = () => {
    setSceneFormOpen(true);
  };

  const handleSaveScene = async (sceneData: Partial<Scene>) => {
    try {
      if (sceneData.scene_id) {
        const { scene_id, ...updateData } = sceneData;
        await apiClient.updateScene(scene_id, updateData);
        toast({
          title: "Scene updated",
          description: "The scene has been updated successfully.",
        });
        await loadScene();
      }
    } catch (error) {
      toast({
        title: "Error updating scene",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scene) return;

    try {
      await apiClient.deleteScene(scene.scene_id);
      toast({
        title: "Scene deleted",
        description: "The scene has been deleted successfully.",
      });
      setLocation("/scenes");
    } catch (error) {
      toast({
        title: "Error deleting scene",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
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

  const handleDeleteCast = (castId: string) => {
    setDeletingCastId(castId);
    setDeleteCastDialogOpen(true);
  };

  const handleDeleteCastConfirm = async () => {
    if (!deletingCastId) return;

    try {
      await apiClient.deleteCast(sceneId, deletingCastId);
      toast({
        title: "Cast member deleted",
        description: "The cast member has been deleted successfully.",
      });
      await loadCastMembers();
      setDeleteCastDialogOpen(false);
      setDeletingCastId(null);
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
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-base font-semibold">Scene Information</h3>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFullInfo(true)}
                      className="h-7 w-7"
                      data-testid="button-view-scene-info"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View full information</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditScene}
                      className="h-7 w-7"
                      data-testid="button-edit-scene-info"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit scene</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDeleteClick}
                      className="h-7 w-7"
                      data-testid="button-delete-scene-info"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete scene</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <IdDisplay id={scene.scene_id} label="ID" testId="text-scene-detail-id" />
              <div>
                <span className="text-muted-foreground">Description </span>
                <span className="text-foreground line-clamp-2">{scene.description}</span>
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
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by any keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-cast"
                />
              </div>

              {filteredCastMembers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-base mb-2">No cast members found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search query
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredCastMembers.map((cast) => (
                    <CastItem
                      key={cast.cast_id}
                      cast={cast}
                      onEdit={handleEditCast}
                      onDelete={handleDeleteCast}
                    />
                  ))}
                </div>
              )}
            </>
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

      <SceneForm
        open={sceneFormOpen}
        onOpenChange={setSceneFormOpen}
        scene={scene}
        onSave={handleSaveScene}
      />

      <Dialog open={showFullInfo} onOpenChange={setShowFullInfo}>
        <DialogContent data-testid="dialog-scene-info">
          <DialogHeader>
            <DialogTitle>Scene Information</DialogTitle>
            <DialogDescription>Complete scene details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">ID</p>
              <p className="text-sm font-mono">{scene.scene_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{scene.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scene.name}"? This action cannot be undone and will also delete all associated cast members.
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

      <AlertDialog open={deleteCastDialogOpen} onOpenChange={setDeleteCastDialogOpen}>
        <AlertDialogContent data-testid="dialog-confirm-delete-cast">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cast member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-cast">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCastConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-cast"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
