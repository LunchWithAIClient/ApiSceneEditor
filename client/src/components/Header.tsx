import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  username: string;
  isAuthenticated: boolean;
  onSignOut: () => void;
  onManageAuth: () => void;
}

export default function Header({ username, isAuthenticated, onSignOut, onManageAuth }: HeaderProps) {
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
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && username && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <User className="w-4 h-4" />
                <span data-testid="text-username">{username}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={isAuthenticated ? onSignOut : onManageAuth}
              data-testid={isAuthenticated ? "button-sign-out" : "button-sign-in"}
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
