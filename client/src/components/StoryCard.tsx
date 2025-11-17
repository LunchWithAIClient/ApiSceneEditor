import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Edit, Trash2, Copy, ChevronDown, Eye } from "lucide-react";
import type { Story } from "@shared/api-types";

interface StoryCardProps {
  story: Story;
  onView: (storyId: string) => void;
  onEdit: (story: Story) => void;
  onDelete: (storyId: string) => void;
  onDuplicate: (story: Story) => void;
}

export default function StoryCard({
  story,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: StoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card data-testid={`card-story-${story.story_id}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium mb-1" data-testid="text-story-name">
              {story.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono" data-testid="text-story-id">
              ID: {story.story_id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(story.story_id)}
              data-testid="button-view-story"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDuplicate(story)}
              data-testid="button-duplicate-story"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(story)}
              data-testid="button-edit-story"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(story.story_id)}
              data-testid="button-delete-story"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-toggle-story"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-base">{story.description}</p>
            </div>
            {story.start_scene_id && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Scene</p>
                <p className="text-xs font-mono">{story.start_scene_id}</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
