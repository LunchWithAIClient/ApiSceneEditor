import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface IdDisplayProps {
  id: string;
  label?: string;
  testId?: string;
  className?: string;
}

export default function IdDisplay({ id, label = "ID", testId, className = "" }: IdDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: label ? `${label} copied successfully` : "ID copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy ID to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} data-testid={testId}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-5 w-5 shrink-0"
        data-testid={`button-copy-${testId}`}
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </Button>
      <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
        {label ? `${label}: ` : ""}{id}
      </span>
    </div>
  );
}
