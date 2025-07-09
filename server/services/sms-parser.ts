import { InsertContribution } from "@shared/schema";

export interface ParsedSMS {
  senderName: string;
  amount: number;
  memberId: string;
  date: Date;
  platform: string;
  rawMessage: string;
}

export class SMSParser {
  private static patterns = {
    zelle: {
      pattern: /You received \$?([\d,]+\.?\d*) from (.+?) on (\d{2}\/\d{2}\/\d{4})\. Memo: (\d+)/,
      groups: { amount: 1, senderName: 2, date: 3, memberId: 4 }
    },
    venmo: {
      pattern: /(.+?) paid you \$?([\d,]+\.?\d*) – "(\d+)" on (\d{2}\/\d{2}\/\d{4})/,
      groups: { senderName: 1, amount: 2, memberId: 3, date: 4 }
    },
    cashapp: {
      pattern: /You received \$?([\d,]+\.?\d*) from (.+?) on (\d{2}\/\d{2}\/\d{4})\. Note: (\d+)/,
      groups: { amount: 1, senderName: 2, date: 3, memberId: 4 }
    },
    mpesa: {
      pattern: /([A-Z0-9]+) Confirmed\. You have received Ksh([\d,]+\.?\d*) from (.+?) (\d+) on (\d{1,2}\/\d{1,2}\/\d{2,4})/,
      groups: { transactionId: 1, amount: 2, senderName: 3, memberId: 4, date: 5 }
    },
    airtel: {
      pattern: /You have received Ksh ([\d,]+\.?\d*) from (.+?) \((\d+)\) on (\d{1,2}\/\d{1,2}\/\d{2,4})/,
      groups: { amount: 1, senderName: 2, memberId: 3, date: 4 }
    }
  };

  static parseSMS(message: string): ParsedSMS | null {
    const normalizedMessage = message.trim();

    for (const [platform, config] of Object.entries(this.patterns)) {
      const match = normalizedMessage.match(config.pattern);
      if (match) {
        try {
          const amount = parseFloat(match[config.groups.amount].replace(/,/g, ''));
          const senderName = match[config.groups.senderName].trim();
          const memberId = match[config.groups.memberId];
          const dateStr = match[config.groups.date];
          
          const date = this.parseDate(dateStr);
          
          return {
            senderName,
            amount,
            memberId,
            date,
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            rawMessage: message
          };
        } catch (error) {
          console.error(`Error parsing ${platform} SMS:`, error);
          return null;
        }
      }
    }

    return null;
  }

  private static parseDate(dateStr: string): Date {
    // Handle various date formats
    const formats = [
      /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, // M/D/YY or M/D/YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        let year = parseInt(match[3]);
        
        // Handle 2-digit years
        if (year < 100) {
          year += 2000;
        }
        
        return new Date(year, month - 1, day);
      }
    }

    // Fallback to current date
    return new Date();
  }

  static createContribution(
    parsed: ParsedSMS,
    campaignId: number
  ): InsertContribution {
    return {
      campaignId,
      senderName: parsed.senderName,
      amount: parsed.amount.toString(),
      memberId: parsed.memberId,
      date: parsed.date,
      source: 'SMS',
      platform: parsed.platform,
      rawMessage: parsed.rawMessage,
      processed: false
    };
  }
}
