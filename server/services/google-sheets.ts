import { Contribution } from "@shared/schema";

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName?: string;
  apiKey: string;
  serviceAccountEmail?: string;
  privateKey?: string;
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  async appendContribution(contribution: Contribution): Promise<boolean> {
    try {
      const values = [
        [
          contribution.senderName,
          `KES ${parseFloat(contribution.amount).toFixed(2)}`,
          contribution.memberId,
          contribution.date.toLocaleDateString('en-GB')
        ]
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.sheetName || 'Sheet1'}:append?valueInputOption=USER_ENTERED&key=${this.config.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({
          values
        })
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error appending to Google Sheets:', error);
      return false;
    }
  }

  async batchAppendContributions(contributions: Contribution[]): Promise<boolean> {
    try {
      const values = contributions.map(contribution => [
        contribution.senderName,
        `KES ${parseFloat(contribution.amount).toFixed(2)}`,
        contribution.memberId,
        contribution.date.toLocaleDateString('en-GB')
      ]);

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.sheetName || 'Sheet1'}:append?valueInputOption=USER_ENTERED&key=${this.config.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`
        },
        body: JSON.stringify({
          values
        })
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error batch appending to Google Sheets:', error);
      return false;
    }
  }

  private getAccessToken(): string {
    // In a real implementation, this would handle OAuth2 token refresh
    // For now, return the API key
    return this.config.apiKey;
  }

  static extractSpreadsheetId(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }
}
