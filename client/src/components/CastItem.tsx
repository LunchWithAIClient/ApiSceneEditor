import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <h4 className="text-lg font-medium" data-testid="text-cast-role">
          {cast.role}
        </h4>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(cast)}
            data-testid="button-edit-cast"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(cast.cast_id)}
            data-testid="button-delete-cast"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <IdDisplay id={cast.cast_id} testId="text-cast-id" />
        <div>
          <p className="text-sm text-muted-foreground">Goal</p>
          <p className="text-base">{cast.goal}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Start</p>
          <p className="text-base">{cast.start}</p>
        </div>
      </CardContent>
    </Card>
  );
}
