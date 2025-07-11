import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { WebhookHandler } from "./services/webhook-handler";
import { GoogleSheetsService } from "./services/google-sheets";
import { insertContributionSchema, insertCampaignSchema, insertApiConfigSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const webhookHandler = new WebhookHandler();

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    webhookHandler.addWSClient(ws);
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });

  // Campaign routes
  app.get('/api/campaigns', async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/campaigns/active', async (req, res) => {
    try {
      const campaign = await storage.getActiveCampaign();
      if (!campaign) {
        return res.status(404).json({ message: 'No active campaign found' });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/campaigns', async (req, res) => {
    try {
      const validated = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validated);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/campaigns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateCampaign(id, validated);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Contribution routes
  app.get('/api/contributions', async (req, res) => {
    try {
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      const contributions = await storage.getContributions(campaignId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/contributions', async (req, res) => {
    try {
      const validated = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(validated);
      res.status(201).json(contribution);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/contributions/stats', async (req, res) => {
    try {
      const activeCampaign = await storage.getActiveCampaign();
      if (!activeCampaign) {
        return res.json({ total: 0, today: 0, week: 0, contributors: 0 });
      }

      const contributions = await storage.getContributions(activeCampaign.id);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const total = contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
      const todayContributions = contributions.filter(c => c.date >= today);
      const weekContributions = contributions.filter(c => c.date >= weekAgo);
      
      const todayTotal = todayContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
      const weekTotal = weekContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
      const contributors = new Set(contributions.map(c => c.senderName)).size;

      res.json({
        total,
        today: todayTotal,
        week: weekTotal,
        contributors
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // API Config routes (both endpoints for compatibility)
  app.get('/api/configs', async (req, res) => {
    try {
      const configs = await storage.getApiConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/configs', async (req, res) => {
    try {
      const validated = insertApiConfigSchema.parse(req.body);
      const config = await storage.createApiConfig(validated);
      res.status(201).json(config);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/configs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertApiConfigSchema.partial().parse(req.body);
      const config = await storage.updateApiConfig(id, validated);
      res.json(config);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Duplicate API Config routes with alternative naming
  app.get('/api/api-configs', async (req, res) => {
    try {
      const configs = await storage.getApiConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/api-configs', async (req, res) => {
    try {
      const validated = insertApiConfigSchema.parse(req.body);
      const config = await storage.createApiConfig(validated);
      res.status(201).json(config);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // System logs (alternative naming)
  app.get('/api/system-logs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // System logs
  app.get('/api/logs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Webhook endpoints
  app.post('/api/webhooks/sms', async (req, res) => {
    try {
      await webhookHandler.handleSMSWebhook(req.body);
      res.json({ message: 'SMS webhook processed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/webhooks/email', async (req, res) => {
    try {
      await webhookHandler.handleEmailWebhook(req.body);
      res.json({ message: 'Email webhook processed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Google Sheets integration
  app.post('/api/sheets/sync', async (req, res) => {
    try {
      const { sheetUrl } = req.body;
      const spreadsheetId = GoogleSheetsService.extractSpreadsheetId(sheetUrl);
      
      if (!spreadsheetId) {
        return res.status(400).json({ message: 'Invalid Google Sheets URL' });
      }

      const activeCampaign = await storage.getActiveCampaign();
      if (!activeCampaign) {
        return res.status(404).json({ message: 'No active campaign found' });
      }

      await storage.updateCampaign(activeCampaign.id, { googleSheetUrl: sheetUrl });
      res.json({ message: 'Google Sheets URL updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
