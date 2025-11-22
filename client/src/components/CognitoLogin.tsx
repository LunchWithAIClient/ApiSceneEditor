import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CognitoLoginProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: () => void;
  needsConfig: boolean;
}

export default function CognitoLogin({
  open,
  onOpenChange,
  onLoginSuccess,
  needsConfig,
}: CognitoLoginProps) {
  const [activeTab, setActiveTab] = useState<string>(needsConfig ? "config" : "login");
  
  // Configuration state
  const [userPoolId, setUserPoolId] = useState("");
  const [clientId, setClientId] = useState("");
  
  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfigSave = () => {
    if (!userPoolId || !clientId) {
      setError("Please enter both User Pool ID and Client ID");
      return;
    }

    try {
      // Import and initialize Cognito config
      import("@/lib/cognitoAuth").then(({ cognitoAuth }) => {
        cognitoAuth.initializeUserPool({
          userPoolId,
          clientId,
        });
        setError("");
        setActiveTab("login");
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to configure Cognito");
    }
  };

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
            {needsConfig 
              ? "Configure your AWS Cognito User Pool to get started"
              : "Sign in to access LunchWith.ai"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config" data-testid="tab-config">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="login" data-testid="tab-login">
              Sign In
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-pool-id">User Pool ID</Label>
              <Input
                id="user-pool-id"
                type="text"
                placeholder="us-east-1_xxxxxxxxx"
                value={userPoolId}
                onChange={(e) => setUserPoolId(e.target.value)}
                data-testid="input-user-pool-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-id">App Client ID</Label>
              <Input
                id="client-id"
                type="text"
                placeholder="Enter your app client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                data-testid="input-client-id"
              />
            </div>
            {error && activeTab === "config" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              onClick={handleConfigSave} 
              className="w-full"
              data-testid="button-save-config"
            >
              Save Configuration
            </Button>
          </TabsContent>

          <TabsContent value="login" className="space-y-4">
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
            {error && activeTab === "login" && (
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
