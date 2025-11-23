import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  username: string;
  userId: string;
  availableUserIds: string[];
  isAuthenticated: boolean;
  onSignOut: () => void;
  onManageAuth: () => void;
  onAccountSwitch: (index: number) => void;
}

export default function Header({ 
  username, 
  userId, 
  availableUserIds = [], 
  isAuthenticated, 
  onSignOut, 
  onManageAuth,
  onAccountSwitch 
}: HeaderProps) {
  const [location] = useLocation();
  const hasMultipleAccounts = availableUserIds.length > 1;
  const currentIndex = availableUserIds.indexOf(userId);

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
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span data-testid="text-username">{username}</span>
                </div>
                
                {hasMultipleAccounts ? (
                  <Select
                    value={currentIndex.toString()}
                    onValueChange={(value) => onAccountSwitch(parseInt(value, 10))}
                  >
                    <SelectTrigger 
                      className="w-[280px] text-xs font-mono"
                      data-testid="select-user-account"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUserIds.map((id, index) => (
                        <SelectItem 
                          key={id} 
                          value={index.toString()}
                          data-testid={`select-user-account-${index}`}
                        >
                          <span className="font-mono text-xs">{id}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div 
                    className="text-xs font-mono text-muted-foreground px-2 py-1 border rounded-md bg-muted/50"
                    data-testid="text-user-id"
                  >
                    {userId}
                  </div>
                )}
              </>
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
