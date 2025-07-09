import { SMSParser } from './sms-parser';
import { EmailParser } from './email-parser';
import { GoogleSheetsService } from './google-sheets';
import { storage } from '../storage';
import { WebSocket } from 'ws';

export class WebhookHandler {
  private wsClients: Set<WebSocket> = new Set();
  private googleSheetsService: GoogleSheetsService | null = null;

  constructor() {
    this.initializeGoogleSheets();
  }

  addWSClient(ws: WebSocket) {
    this.wsClients.add(ws);
    ws.on('close', () => {
      this.wsClients.delete(ws);
    });
  }

  private async initializeGoogleSheets() {
    const config = await storage.getApiConfigByType('SHEETS');
    if (config) {
      try {
        const sheetConfig = JSON.parse(config.config);
        this.googleSheetsService = new GoogleSheetsService(sheetConfig);
      } catch (error) {
        console.error('Error initializing Google Sheets:', error);
      }
    }
  }

  async handleSMSWebhook(payload: any): Promise<void> {
    try {
      const { message, from, timestamp } = payload;
      
      await this.logMessage('INFO', 'SMS_WEBHOOK', `Received SMS from ${from}`, payload);

      const parsed = SMSParser.parseSMS(message);
      if (!parsed) {
        await this.logMessage('WARNING', 'SMS_PARSER', 'Failed to parse SMS message', { message });
        return;
      }

      const activeCampaign = await storage.getActiveCampaign();
      if (!activeCampaign) {
        await this.logMessage('ERROR', 'SMS_WEBHOOK', 'No active campaign found');
        return;
      }

      const contribution = await storage.createContribution(
        SMSParser.createContribution(parsed, activeCampaign.id)
      );

      // Update Google Sheets
      if (this.googleSheetsService) {
        const success = await this.googleSheetsService.appendContribution(contribution);
        if (success) {
          await storage.updateContribution(contribution.id, { processed: true });
        }
      }

      // Broadcast to WebSocket clients
      this.broadcastToClients({
        type: 'NEW_CONTRIBUTION',
        data: contribution
      });

      await this.logMessage('INFO', 'SMS_WEBHOOK', 'Successfully processed SMS contribution', {
        contributionId: contribution.id,
        amount: contribution.amount,
        sender: contribution.senderName
      });

    } catch (error) {
      await this.logMessage('ERROR', 'SMS_WEBHOOK', 'Error processing SMS webhook', { error: error.message });
      throw error;
    }
  }

  async handleEmailWebhook(payload: any): Promise<void> {
    try {
      const { subject, body, from, receivedDate } = payload;
      
      await this.logMessage('INFO', 'EMAIL_WEBHOOK', `Received email from ${from}`, { subject });

      const parsed = EmailParser.parseEmail(subject, body, new Date(receivedDate));
      if (!parsed) {
        await this.logMessage('WARNING', 'EMAIL_PARSER', 'Failed to parse email message', { subject, from });
        return;
      }

      const activeCampaign = await storage.getActiveCampaign();
      if (!activeCampaign) {
        await this.logMessage('ERROR', 'EMAIL_WEBHOOK', 'No active campaign found');
        return;
      }

      const contribution = await storage.createContribution(
        EmailParser.createContribution(parsed, activeCampaign.id)
      );

      // Update Google Sheets
      if (this.googleSheetsService) {
        const success = await this.googleSheetsService.appendContribution(contribution);
        if (success) {
          await storage.updateContribution(contribution.id, { processed: true });
        }
      }

      // Broadcast to WebSocket clients
      this.broadcastToClients({
        type: 'NEW_CONTRIBUTION',
        data: contribution
      });

      await this.logMessage('INFO', 'EMAIL_WEBHOOK', 'Successfully processed email contribution', {
        contributionId: contribution.id,
        amount: contribution.amount,
        sender: contribution.senderName
      });

    } catch (error) {
      await this.logMessage('ERROR', 'EMAIL_WEBHOOK', 'Error processing email webhook', { error: error.message });
      throw error;
    }
  }

  private broadcastToClients(message: any) {
    const data = JSON.stringify(message);
    this.wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  private async logMessage(level: string, service: string, message: string, data?: any) {
    await storage.createSystemLog({
      level,
      service,
      message,
      data: data ? JSON.stringify(data) : undefined
    });
  }
}
