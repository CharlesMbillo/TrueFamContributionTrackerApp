import { InsertContribution } from "@shared/schema";

export interface ParsedEmail {
  senderName: string;
  amount: number;
  memberId: string;
  date: Date;
  platform: string;
  rawMessage: string;
}

export class EmailParser {
  private static patterns = {
    zelle: {
      subjectPattern: /You've received money from (.+)/,
      bodyPattern: /(.+?) has sent you \$?([\d,]+\.?\d*) with Zelle.*?Memo: (\d+)/s,
      groups: { senderName: 1, amount: 2, memberId: 3 }
    },
    venmo: {
      subjectPattern: /(.+?) sent you \$?([\d,]+\.?\d*)/,
      bodyPattern: /(.+?) just sent you \$?([\d,]+\.?\d*) on Venmo.*?Note: (\d+)/s,
      groups: { senderName: 1, amount: 2, memberId: 3 }
    },
    cashapp: {
      subjectPattern: /Payment Received - \$?([\d,]+\.?\d*) from (.+)/,
      bodyPattern: /You've received \$?([\d,]+\.?\d*) from (.+?) on.*?Note: (\d+)/s,
      groups: { amount: 1, senderName: 2, memberId: 3 }
    }
  };

  static parseEmail(subject: string, body: string, receivedDate: Date): ParsedEmail | null {
    const normalizedSubject = subject.trim();
    const normalizedBody = body.replace(/\n/g, ' ').trim();

    for (const [platform, config] of Object.entries(this.patterns)) {
      const subjectMatch = normalizedSubject.match(config.subjectPattern);
      const bodyMatch = normalizedBody.match(config.bodyPattern);
      
      if (subjectMatch && bodyMatch) {
        try {
          let senderName: string;
          let amount: number;
          let memberId: string;

          if (platform === 'zelle') {
            senderName = bodyMatch[config.groups.senderName].trim();
            amount = parseFloat(bodyMatch[config.groups.amount].replace(/,/g, ''));
            memberId = bodyMatch[config.groups.memberId];
          } else if (platform === 'venmo') {
            senderName = bodyMatch[config.groups.senderName].trim();
            amount = parseFloat(bodyMatch[config.groups.amount].replace(/,/g, ''));
            memberId = bodyMatch[config.groups.memberId];
          } else if (platform === 'cashapp') {
            amount = parseFloat(bodyMatch[config.groups.amount].replace(/,/g, ''));
            senderName = bodyMatch[config.groups.senderName].trim();
            memberId = bodyMatch[config.groups.memberId];
          } else {
            continue;
          }

          return {
            senderName,
            amount,
            memberId,
            date: receivedDate,
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            rawMessage: `Subject: ${subject}\n\nBody: ${body}`
          };
        } catch (error) {
          console.error(`Error parsing ${platform} email:`, error);
          return null;
        }
      }
    }

    return null;
  }

  static createContribution(
    parsed: ParsedEmail,
    campaignId: number
  ): InsertContribution {
    return {
      campaignId,
      senderName: parsed.senderName,
      amount: parsed.amount.toString(),
      memberId: parsed.memberId,
      date: parsed.date,
      source: 'EMAIL',
      platform: parsed.platform,
      rawMessage: parsed.rawMessage,
      processed: false
    };
  }
}
