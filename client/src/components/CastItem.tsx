import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2 } from "lucide-react";
import type { Cast } from "@shared/api-types";
import IdDisplay from "@/components/IdDisplay";

interface CastItemProps {
  cast: Cast;
  onEdit: (cast: Cast) => void;
  onDelete: (castId: string) => void;
}

export default function CastItem({ cast, onEdit, onDelete }: CastItemProps) {
  return (
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
          <div>
            <span className="text-muted-foreground">Goal </span>
            <span className="text-foreground">{cast.goal}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Start </span>
            <span className="text-foreground">{cast.start}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
