import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import APIKeyDialog from "@/components/APIKeyDialog";
import Characters from "@/pages/Characters";
import Scenes from "@/pages/Scenes";
import SceneDetail from "@/pages/SceneDetail";
import { apiClient } from "@/lib/lunchWithApi";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Characters} />
      <Route path="/characters" component={Characters} />
      <Route path="/scenes" component={Scenes} />
      <Route path="/scenes/:id" component={SceneDetail} />
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

  useEffect(() => {
    const storedKey = apiClient.getApiKey();
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setApiKeyDialogOpen(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    apiClient.setApiKey(key);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
