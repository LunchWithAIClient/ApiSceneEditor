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
import { setSessionExpiredHandler } from "@/lib/lunchWithApi";

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [username, setUsername] = useState("");

  /**
   * Handle session expiration from API requests
   */
  const handleSessionExpired = () => {
    cognitoAuth.signOut();
    queryClient.clear();
    setIsAuthenticated(false);
    setUsername("");
    setLoginDialogOpen(true);
  };

  /**
   * Set up session expiration handler on mount
   */
  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
  }, []);

  /**
   * Check for existing Cognito session on mount
   * If no session or not configured, show login dialog
   */
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    setIsCheckingAuth(true);
    
    // Check if Cognito is configured via environment variables
    if (!cognitoAuth.isConfigured()) {
      console.error("Cognito not configured. Please set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID environment variables.");
      // Stop loading but don't set authenticated - will show config error
      setIsCheckingAuth(false);
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
    
    setIsCheckingAuth(false);
  };

  /**
   * Handle successful login
   * Closes dialog, marks user as authenticated, and invalidates all queries
   */
  const handleLoginSuccess = async () => {
    const session = await cognitoAuth.getCurrentSession();
    if (session) {
      setIsAuthenticated(true);
      setUsername(session.user.username);
      
      // Invalidate all queries to refetch data with new authentication
      await queryClient.invalidateQueries();
    }
  };

  /**
   * Handle sign out
   * Clears session, clears query cache, and shows login dialog
   */
  const handleSignOut = () => {
    cognitoAuth.signOut();
    setIsAuthenticated(false);
    setUsername("");
    
    // Clear all cached queries when signing out
    queryClient.clear();
    
    setLoginDialogOpen(true);
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </QueryClientProvider>
    );
  }

  // Show configuration error if Cognito is not configured
  if (!cognitoAuth.isConfigured()) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md px-4">
            <h1 className="text-3xl font-bold mb-4 text-destructive">Configuration Error</h1>
            <p className="text-muted-foreground mb-4">
              AWS Cognito is not configured. Please set the following environment variables:
            </p>
            <div className="bg-muted p-4 rounded-md text-left font-mono text-sm mb-4">
              <div>VITE_COGNITO_USER_POOL_ID</div>
              <div>VITE_COGNITO_CLIENT_ID</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Contact your administrator or check the deployment configuration.
            </p>
          </div>
        </div>
      </QueryClientProvider>
    );
  }

  // Render authenticated app
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        {!isAuthenticated ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">LunchWith.ai Manager</h1>
              <p className="text-muted-foreground mb-4">Please sign in to continue</p>
            </div>
          </div>
        ) : (
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
        )}
        <CognitoLogin
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
