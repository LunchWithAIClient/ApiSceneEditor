import type { Express } from "express";
import { createServer, type Server } from "http";

const LUNCHWITH_API_BASE = "https://api2.lunchwith.ai";

async function proxyToLunchWithAPI(
  endpoint: string,
  method: string,
  apiKey: string,
  userId?: string,
  body?: any
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Authorization": apiKey,
  };

  // Add user ID header if provided
  if (userId) {
    (headers as Record<string, string>)["X-LWAI-User-Id"] = userId;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  // Only include body for methods that support it (not GET, HEAD, DELETE)
  const methodsWithBody = ['PUT', 'POST', 'PATCH'];
  if (body && methodsWithBody.includes(method.toUpperCase())) {
    config.body = JSON.stringify(body);
  }

  return fetch(`${LUNCHWITH_API_BASE}${endpoint}`, config);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy route for LunchWith.ai API to avoid CORS issues in the browser
  app.all("/api/lunchwith/*", async (req, res) => {
    try {
      // Extract API key from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Missing API key in Authorization header" });
      }

      const apiKey = authHeader;
      
      // Extract user ID from X-LWAI-User-Id header (optional for /user/me endpoint)
      const userId = req.headers["x-lwai-user-id"] as string | undefined;
      
      // Extract the endpoint path and preserve query string
      // req.url includes both path and query string
      const endpoint = req.url.replace("/api/lunchwith", "");
      
      // Forward the request to LunchWith.ai API
      const response = await proxyToLunchWithAPI(
        endpoint,
        req.method,
        apiKey,
        userId,
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
