import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Cast } from "@shared/api-types";
import IdDisplay from "@/components/IdDisplay";

interface CastItemProps {
  cast: Cast;
  onEdit: (cast: Cast) => void;
  onDelete: (castId: string) => void;
}

export default function CastItem({ cast, onEdit, onDelete }: CastItemProps) {
  const [showFullInfo, setShowFullInfo] = useState(false);

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      <Card data-testid={`card-cast-${cast.cast_id}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h4 className="text-base font-medium" data-testid="text-cast-role">
              {cast.role}
            </h4>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFullInfo(true)}
                    className="h-7 w-7"
                    data-testid="button-view-cast"
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
                    onClick={() => onEdit(cast)}
                    className="h-7 w-7"
                    data-testid="button-edit-cast"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit cast member</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(cast.cast_id)}
                    className="h-7 w-7"
                    data-testid="button-delete-cast"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete cast member</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <IdDisplay id={cast.cast_id} label="ID" testId="text-cast-id" />
            <div className="truncate">
              <span className="text-muted-foreground">Goal </span>
              <span className="text-foreground">{truncateText(cast.goal)}</span>
            </div>
            <div className="truncate">
              <span className="text-muted-foreground">Start </span>
              <span className="text-foreground">{truncateText(cast.start)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFullInfo} onOpenChange={setShowFullInfo}>
        <DialogContent data-testid="dialog-cast-info">
          <DialogHeader>
            <DialogTitle>{cast.role}</DialogTitle>
            <DialogDescription>Full cast member information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">ID</p>
              <p className="text-sm font-mono">{cast.cast_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Goal</p>
              <p className="text-sm">{cast.goal}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Start</p>
              <p className="text-sm">{cast.start}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
