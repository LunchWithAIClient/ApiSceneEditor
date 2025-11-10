import type { Express } from "express";
import { createServer, type Server } from "http";

const LUNCHWITH_API_BASE = "https://api.lunchwith.ai";

async function proxyToLunchWithAPI(
  endpoint: string,
  method: string,
  apiKey: string,
  body?: any
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  return fetch(`${LUNCHWITH_API_BASE}${endpoint}`, config);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy route for LunchWith.ai API
  app.all("/api/lunchwith/*", async (req, res) => {
    try {
      // Extract API key from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid API key" });
      }

      const apiKey = authHeader.substring(7);
      
      // Extract the endpoint path (remove /api/lunchwith prefix)
      const endpoint = req.path.replace("/api/lunchwith", "");
      
      // Forward the request to LunchWith.ai API
      const response = await proxyToLunchWithAPI(
        endpoint,
        req.method,
        apiKey,
        req.body
      );

      // Get response text
      const responseText = await response.text();
      
      // Set the status code
      res.status(response.status);
      
      // Copy relevant headers
      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("content-type", contentType);
      }

      // Send the response
      if (responseText) {
        res.send(responseText);
      } else {
        res.end();
      }
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ 
        error: "Proxy request failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
