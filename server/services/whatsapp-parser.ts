import { InsertContribution } from '@shared/schema';

export interface ParsedWhatsAppMessage {
  senderName: string;
  amount: number;
  memberId: string;
  date: Date;
  platform: string;
  rawMessage: string;
  phoneNumber?: string;
}

export class WhatsAppParser {
  private static patterns = {
    // M-Pesa patterns for WhatsApp notifications
    mpesa: {
      confirmation: /(?:received|confirmed)\s+KES?\s?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+on|\s+\w+|\.|$)/i,
      memberExtract: /(?:member|ref|id|account)[\s:]*([A-Z0-9]{6,})/i,
      phoneExtract: /(\+?254\d{9}|\d{10})/
    },
    
    // Airtel Money patterns
    airtel: {
      confirmation: /(?:received|got)\s+KES?\s?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+via|\s+on|\.|$)/i,
      memberExtract: /(?:ref|reference|id)[\s:]*([A-Z0-9]{6,})/i
    },
    
    // General payment patterns for WhatsApp Pay
    whatsappPay: {
      confirmation: /(?:payment|received|sent)\s+(?:of\s+)?(?:KES|USD|EUR)?\s?([\d,]+\.?\d*).+?(?:from|to)\s+(.+?)(?:\s+|$)/i,
      memberExtract: /(?:id|ref|member|account)[\s:]*([A-Z0-9]{4,})/i
    },

    // International payment patterns  
    international: {
      zelle: /(?:Zelle|payment).*?(?:received|got)\s+(?:\$|USD)?\s?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+via|\s+Member|\.|$)/i,
      venmo: /Venmo.+?(?:received|got)\s+\$?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+|$)/i,
      cashapp: /Cash\s*App.+?(?:received|got)\s+\$?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+|$)/i
    }
  };

  static parseWhatsAppMessage(messageBody: string, senderPhone?: string): ParsedWhatsAppMessage | null {
    const cleanMessage = messageBody.trim();
    
    // Try M-Pesa pattern first
    let match = cleanMessage.match(this.patterns.mpesa.confirmation);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const senderName = this.cleanSenderName(match[2]);
      const memberId = this.extractMemberId(cleanMessage) || senderPhone || 'Unknown';
      
      return {
        senderName,
        amount,
        memberId,
        date: new Date(),
        platform: 'M-Pesa',
        rawMessage: cleanMessage,
        phoneNumber: senderPhone
      };
    }

    // Try Airtel Money pattern
    match = cleanMessage.match(this.patterns.airtel.confirmation);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const senderName = this.cleanSenderName(match[2]);
      const memberId = this.extractMemberId(cleanMessage) || senderPhone || 'Unknown';
      
      return {
        senderName,
        amount,
        memberId,
        date: new Date(),
        platform: 'Airtel Money',
        rawMessage: cleanMessage,
        phoneNumber: senderPhone
      };
    }

    // Try WhatsApp Pay pattern
    match = cleanMessage.match(this.patterns.whatsappPay.confirmation);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const senderName = this.cleanSenderName(match[2]);
      const memberId = this.extractMemberId(cleanMessage) || senderPhone || 'Unknown';
      
      return {
        senderName,
        amount,
        memberId,
        date: new Date(),
        platform: 'WhatsApp Pay',
        rawMessage: cleanMessage,
        phoneNumber: senderPhone
      };
    }

    // Try international payment patterns
    for (const [platform, pattern] of Object.entries(this.patterns.international)) {
      match = cleanMessage.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        const senderName = this.cleanSenderName(match[2]);
        const memberId = this.extractMemberId(cleanMessage) || senderPhone || 'Unknown';
        
        return {
          senderName,
          amount,
          memberId,
          date: new Date(),
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          rawMessage: cleanMessage,
          phoneNumber: senderPhone
        };
      }
    }

    // Try generic payment pattern as fallback
    const genericPattern = /(?:payment|received|got|sent).*?(?:\$|KES|USD|EUR)?\s?([\d,]+\.?\d*).+?(?:from|to)\s+(.+?)(?:\s+|Member:|ID:|$)/i;
    match = cleanMessage.match(genericPattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const senderName = this.cleanSenderName(match[2]);
      const memberId = this.extractMemberId(cleanMessage) || senderPhone || 'Unknown';
      
      return {
        senderName,
        amount,
        memberId,
        date: new Date(),
        platform: 'WhatsApp Pay',
        rawMessage: cleanMessage,
        phoneNumber: senderPhone
      };
    }

    return null;
  }

  private static cleanSenderName(name: string): string {
    return name
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private static extractMemberId(message: string): string | null {
    // Try different member ID patterns
    const patterns = [
      this.patterns.mpesa.memberExtract,
      this.patterns.airtel.memberExtract,
      this.patterns.whatsappPay.memberExtract
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  static createContribution(
    parsed: ParsedWhatsAppMessage,
    campaignId?: number
  ): InsertContribution {
    return {
      campaignId,
      senderName: parsed.senderName,
      amount: parsed.amount.toString(),
      memberId: parsed.memberId,
      date: parsed.date,
      source: 'whatsapp',
      platform: parsed.platform,
      rawMessage: parsed.rawMessage,
      processed: false
    };
  }

  // WhatsApp Business API specific methods
  static extractMessageFromWebhook(webhookData: any): { message: string; senderPhone: string } | null {
    try {
      // Handle WhatsApp Business API webhook structure
      if (webhookData.object === 'whatsapp_business_account') {
        const entry = webhookData.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        
        if (value?.messages && value.messages.length > 0) {
          const message = value.messages[0];
          const senderPhone = message.from;
          
          if (message.type === 'text') {
            return {
              message: message.text.body,
              senderPhone
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting WhatsApp message:', error);
      return null;
    }
  }

  // Send WhatsApp confirmation message
  static async sendConfirmationMessage(phoneNumber: string, contribution: ParsedWhatsAppMessage, accessToken: string, phoneNumberId: string): Promise<boolean> {
    try {
      const message = `✅ Contribution Confirmed!\n\nAmount: KES ${contribution.amount.toLocaleString()}\nFrom: ${contribution.senderName}\nMember ID: ${contribution.memberId}\nPlatform: ${contribution.platform}\n\nThank you for your contribution to the TRUEFAM campaign!`;
      
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending WhatsApp confirmation:', error);
      return false;
    }
  }
}