/**
 * Main Application Component
 * 
 * This is the root component that provides:
 * - Routing configuration for all pages
 * - Global state providers (QueryClient, TooltipProvider)
 * - API key management and authentication flow
 * - Application layout (Header + Main content)
 * 
 * Flow:
 * 1. On mount, check if API key exists in localStorage
 * 2. If no API key, show API key dialog
 * 3. When API key is saved, reload page to reinitialize all components
 * 4. Render appropriate page based on route
 */

import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import APIKeyDialog from "@/components/APIKeyDialog";
import Characters from "@/pages/Characters";
import CharacterDetail from "@/pages/CharacterDetail";
import Scenes from "@/pages/Scenes";
import SceneDetail from "@/pages/SceneDetail";
import { apiClient } from "@/lib/lunchWithApi";

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
  const [apiKey, setApiKey] = useState("");
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  /**
   * Check for stored API key on mount
   * If missing, show dialog to prompt user for key
   */
  useEffect(() => {
    const storedKey = apiClient.getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setApiKeyDialogOpen(true);
    }
  }, []);

  /**
   * Saves new API key and reloads the page
   * Page reload ensures apiClient singleton picks up the new key from localStorage
   * @param key - The new API key to save
   */
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    apiClient.setApiKey(key);
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <div className="min-h-screen bg-background">
          <Header 
            apiKey={apiKey} 
            onManageApiKey={() => setApiKeyDialogOpen(true)} 
          />
          <main>
            <Router />
          </main>
        </div>
        <APIKeyDialog
          open={apiKeyDialogOpen}
          onOpenChange={setApiKeyDialogOpen}
          currentApiKey={apiKey}
          onSave={handleSaveApiKey}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
