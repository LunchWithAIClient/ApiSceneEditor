import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Search } from "lucide-react";
import StoryCard from "@/components/StoryCard";
import StoryForm from "@/components/StoryForm";
import { apiClient } from "@/lib/lunchWithApi";
import { useToast } from "@/hooks/use-toast";
import type { Story } from "@shared/api-types";

export default function Stories() {
  const [, setLocation] = useLocation();
  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return stories;
    
    const query = searchQuery.toLowerCase();
    return stories.filter(
      (story) =>
        story.name.toLowerCase().includes(query) ||
        story.story_id.toLowerCase().includes(query)
    );
  }, [stories, searchQuery]);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getStories();
      setStories(data);
    } catch (error) {
      toast({
        title: "Error loading stories",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingStory(undefined);
    setFormOpen(true);
  };

  const handleView = (storyId: string) => {
    setLocation(`/stories/${storyId}`);
  };

  const handleSave = async (storyData: Partial<Story>) => {
    try {
      if (storyData.story_id) {
        const { story_id, start_scene_id, ...updateData } = storyData;
        await apiClient.updateStory(story_id, updateData);
        toast({
          title: "Story updated",
          description: "The story has been updated successfully.",
        });
      } else {
        await apiClient.createStory({
          name: storyData.name || "",
          description: storyData.description || "",
        });
        toast({
          title: "Story created",
          description: "The story has been created successfully.",
        });
      }
      await loadStories();
    } catch (error) {
      toast({
        title: "Error saving story",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!confirm("Are you sure you want to delete this story?")) {
      return;
    }

    try {
      await apiClient.deleteStory(storyId);
      toast({
        title: "Story deleted",
        description: "The story has been deleted successfully.",
      });
      await loadStories();
    } catch (error) {
      toast({
        title: "Error deleting story",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (story: Story) => {
    try {
      await apiClient.createStory({
        name: `${story.name} (Copy)`,
        description: story.description,
      });
      toast({
        title: "Story duplicated",
        description: "The story has been duplicated successfully.",
      });
      await loadStories();
    } catch (error) {
      toast({
        title: "Error duplicating story",
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
        <h2 className="text-3xl font-bold">Stories</h2>
        <Button onClick={handleAdd} data-testid="button-add-story">
          <Plus className="w-4 h-4 mr-2" />
          Add New Story
        </Button>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-2">No stories yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first story to get started
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Story
          </Button>
        </div>
      ) : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-stories"
            />
          </div>

          {filteredStories.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-medium mb-2">No stories found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStories.map((story) => (
                <StoryCard
                  key={story.story_id}
                  story={story}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}
        </>
      )}

      <StoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        story={editingStory}
        onSave={handleSave}
      />
    </div>
  );
}
