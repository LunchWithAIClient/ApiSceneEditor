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
import { Eye, ChevronDown } from "lucide-react";
import type { Character } from "@shared/api-types";
import IdDisplay from "@/components/IdDisplay";

interface CharacterCardProps {
  character: Character;
}

export default function CharacterCard({
  character,
}: CharacterCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card data-testid={`card-character-${character.character_id}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium mb-1" data-testid="text-character-name">
              {character.name}
            </h3>
            <IdDisplay id={character.character_id} testId="text-character-id" />
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  data-testid="button-view-character"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View character</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-toggle-character"
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
          <CardContent className="space-y-3 pt-0">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-base">{character.description}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Motivation</p>
              <p className="text-base">{character.motivation}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
