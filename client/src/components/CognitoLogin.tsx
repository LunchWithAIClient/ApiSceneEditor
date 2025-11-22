import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CognitoLoginProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: () => void;
}

export default function CognitoLogin({
  open,
  onOpenChange,
  onLoginSuccess,
}: CognitoLoginProps) {
  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { cognitoAuth } = await import("@/lib/cognitoAuth");
      await cognitoAuth.signIn(username, password);
      
      // Success - notify parent component
      onLoginSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-cognito-login">
        <DialogHeader>
          <DialogTitle>AWS Cognito Authentication</DialogTitle>
          <DialogDescription>
            Sign in to access LunchWith.ai
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username or Email</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="input-username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleLogin();
                }
              }}
              data-testid="input-password"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={handleLogin} 
            className="w-full"
            disabled={isLoading}
            data-testid="button-sign-in"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
