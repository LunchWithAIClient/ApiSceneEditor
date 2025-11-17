import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

interface HeaderProps {
  apiKey: string;
  onManageApiKey: () => void;
}

export default function Header({ apiKey, onManageApiKey }: HeaderProps) {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">LunchWith.ai Manager</h1>
            <nav className="flex gap-1">
              <Link href="/">
                <Button
                  variant={location === "/" ? "secondary" : "ghost"}
                  data-testid="nav-characters"
                >
                  Characters
                </Button>
              </Link>
              <Link href="/scenes">
                <Button
                  variant={location === "/scenes" ? "secondary" : "ghost"}
                  data-testid="nav-scenes"
                >
                  Scenes
                </Button>
              </Link>
              <Link href="/stories">
                <Button
                  variant={location === "/stories" || location.startsWith("/stories/") ? "secondary" : "ghost"}
                  data-testid="nav-stories"
                >
                  Stories
                </Button>
              </Link>
            </nav>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageApiKey}
            data-testid="button-api-key"
          >
            <Key className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {apiKey ? "API Key Set" : "No API Key"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
