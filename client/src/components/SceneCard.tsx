import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, Eye, Copy, Check } from "lucide-react";
import type { Scene, Cast } from "@shared/api-types";
import IdDisplay from "@/components/IdDisplay";
import { useToast } from "@/hooks/use-toast";

interface SceneCardProps {
  scene: Scene;
  castMembers: Cast[];
  onView: (sceneId: string) => void;
}

export default function SceneCard({
  scene,
  castMembers,
  onView,
}: SceneCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card data-testid={`card-scene-${scene.scene_id}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium mb-1" data-testid="text-scene-name">
              {scene.name}
            </h3>
            <IdDisplay id={scene.scene_id} testId="text-scene-id" />
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Description </span>
              <span className="text-foreground">{truncateText(scene.description)}</span>
            </div>
            {castMembers.length > 0 && (
              <div className="mt-2 space-y-1">
                {castMembers.map((cast) => (
                  <CastMemberDisplay
                    key={cast.cast_id}
                    cast={cast}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(scene.scene_id)}
                  data-testid="button-view-scene"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View scene details</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-toggle-scene"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOpen ? "Collapse details" : "Expand details"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Full Description</p>
              <p className="text-base">{scene.description}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function CastMemberDisplay({ cast }: { cast: Cast }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cast.cast_id);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Cast ID copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy cast ID to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-1" data-testid={`cast-member-${cast.cast_id}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-5 w-5 shrink-0"
            data-testid={`button-copy-cast-${cast.cast_id}`}
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy cast ID"}</p>
        </TooltipContent>
      </Tooltip>
      <span className="text-xs text-muted-foreground font-mono">
        {cast.role} - {cast.cast_id}
      </span>
    </div>
  );
}
