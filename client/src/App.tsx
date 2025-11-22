/**
 * Main Application Component
 * 
 * This is the root component that provides:
 * - Routing configuration for all pages
 * - Global state providers (QueryClient, TooltipProvider)
 * - Cognito authentication flow
 * - Application layout (Header + Main content)
 * 
 * Flow:
 * 1. On mount, check if user has a valid Cognito session
 * 2. If not authenticated, show Cognito login dialog
 * 3. When authenticated, allow access to the application
 * 4. Render appropriate page based on route
 */

import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import CognitoLogin from "@/components/CognitoLogin";
import Characters from "@/pages/Characters";
import CharacterDetail from "@/pages/CharacterDetail";
import Scenes from "@/pages/Scenes";
import SceneDetail from "@/pages/SceneDetail";
import { cognitoAuth } from "@/lib/cognitoAuth";

/**
 * Application Router
 * Defines all routes and their corresponding page components
 * Includes a 404 fallback for unmatched routes
 */
function Router() {
  return (
    <Switch>
      {/* Characters routes */}
      <Route path="/" component={Characters} />
      <Route path="/characters" component={Characters} />
      <Route path="/characters/:id" component={CharacterDetail} />
      
      {/* Scenes routes */}
      <Route path="/scenes" component={Scenes} />
      <Route path="/scenes/:id" component={SceneDetail} />
      
      {/* 404 fallback */}
      <Route>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p className="text-muted-foreground">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [needsConfig, setNeedsConfig] = useState(false);
  const [username, setUsername] = useState("");

  /**
   * Check for existing Cognito session on mount
   * If no session or not configured, show login dialog
   */
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    // Check if Cognito is configured
    if (!cognitoAuth.isConfigured()) {
      setNeedsConfig(true);
      setLoginDialogOpen(true);
      return;
    }

    // Check for existing session
    const session = await cognitoAuth.getCurrentSession();
    if (session) {
      setIsAuthenticated(true);
      setUsername(session.user.username);
    } else {
      setLoginDialogOpen(true);
    }
  };

  /**
   * Handle successful login
   * Closes dialog and marks user as authenticated
   */
  const handleLoginSuccess = async () => {
    const session = await cognitoAuth.getCurrentSession();
    if (session) {
      setIsAuthenticated(true);
      setUsername(session.user.username);
      setNeedsConfig(false);
    }
  };

  /**
   * Handle sign out
   * Clears session and shows login dialog
   */
  const handleSignOut = () => {
    cognitoAuth.signOut();
    setIsAuthenticated(false);
    setUsername("");
    setLoginDialogOpen(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <div className="min-h-screen bg-background">
          <Header 
            username={username}
            isAuthenticated={isAuthenticated}
            onSignOut={handleSignOut}
            onManageAuth={() => setLoginDialogOpen(true)}
          />
          <main>
            <Router />
          </main>
        </div>
        <CognitoLogin
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          onLoginSuccess={handleLoginSuccess}
          needsConfig={needsConfig}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
