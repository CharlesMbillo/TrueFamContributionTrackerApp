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
    // M-Pesa patterns - comprehensive coverage
    mpesa: {
      confirmation: [
        /(?:received|confirmed|got)\s+KES?\s?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+on|\s+\w+|\.|$)/i,
        /KES?\s?([\d,]+\.?\d*)\s+(?:received|confirmed|from)\s+(.+?)(?:\s+via\s+M-?Pesa|\s+\w+|\.|$)/i,
        /M-?Pesa.*?KES?\s?([\d,]+\.?\d*).+?(?:from|by)\s+(.+?)(?:\s+|\.|\n|$)/i
      ],
      memberExtract: /(?:member|ref|id|account|code)[\s:]*([A-Z0-9]{3,})/i,
      phoneExtract: /(\+?254\d{9}|\d{10})/
    },
    
    // Airtel Money patterns - enhanced
    airtel: {
      confirmation: [
        /(?:received|got|confirmed)\s+KES?\s?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+via|\s+on|\.|$)/i,
        /Airtel\s*Money.*?KES?\s?([\d,]+\.?\d*).+?(?:from|by)\s+(.+?)(?:\s+|\.|\n|$)/i,
        /KES?\s?([\d,]+\.?\d*)\s+(?:received|from).*?Airtel.*?(.+?)(?:\s+|\.|\n|$)/i
      ],
      memberExtract: /(?:ref|reference|id|account|member)[\s:]*([A-Z0-9]{3,})/i
    },
    
    // Bank transfers and mobile money
    banking: {
      confirmation: [
        /(?:received|transferred|sent)\s+(?:KES|USD|EUR)?\s?([\d,]+\.?\d*).+?(?:from|to)\s+(.+?)(?:\s+via|\s+bank|\.|$)/i,
        /Bank\s+transfer.*?(?:KES|USD|EUR)?\s?([\d,]+\.?\d*).+?(?:from|by)\s+(.+?)(?:\s+|\.|\n|$)/i
      ],
      memberExtract: /(?:ref|reference|account|member|id)[\s:]*([A-Z0-9]{3,})/i
    },
    
    // International payment patterns - improved
    international: {
      zelle: [
        /(?:Zelle|payment).*?(?:received|got)\s+(?:\$|USD)?\s?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+via|\s+Member|\.|$)/i,
        /\$?([\d,]+\.?\d*)\s+(?:received|from).*?Zelle.*?(.+?)(?:\s+Member|\s+ID|\.|$)/i
      ],
      venmo: [
        /Venmo.+?(?:received|got)\s+\$?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+|$)/i,
        /\$?([\d,]+\.?\d*)\s+(?:received|from).*?Venmo.*?(.+?)(?:\s+|\.|\n|$)/i
      ],
      cashapp: [
        /Cash\s*App.+?(?:received|got)\s+\$?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+|$)/i,
        /\$?([\d,]+\.?\d*)\s+(?:received|from).*?Cash\s*App.*?(.+?)(?:\s+|\.|\n|$)/i
      ],
      paypal: [
        /PayPal.+?(?:received|got)\s+(?:\$|USD|EUR)?\s?([\d,]+\.?\d*).+?from\s+(.+?)(?:\s+|$)/i,
        /(?:\$|USD|EUR)?\s?([\d,]+\.?\d*)\s+(?:received|from).*?PayPal.*?(.+?)(?:\s+|\.|\n|$)/i
      ]
    },

    // WhatsApp Pay specific patterns
    whatsappPay: {
      confirmation: [
        /(?:payment|received|sent)\s+(?:of\s+)?(?:KES|USD|EUR)?\s?([\d,]+\.?\d*).+?(?:from|to)\s+(.+?)(?:\s+|$)/i,
        /WhatsApp\s*Pay.*?(?:KES|USD|EUR)?\s?([\d,]+\.?\d*).+?(?:from|by)\s+(.+?)(?:\s+|\.|\n|$)/i
      ],
      memberExtract: /(?:id|ref|member|account|code)[\s:]*([A-Z0-9]{3,})/i
    }
  };

  static parseWhatsAppMessage(messageBody: string, senderPhone?: string): ParsedWhatsAppMessage | null {
    const cleanMessage = messageBody.trim();
    
    // Helper function to try multiple patterns
    const tryPatterns = (patterns: RegExp[], platformName: string) => {
      for (const pattern of patterns) {
        const match = cleanMessage.match(pattern);
        if (match) {
          const amount = parseFloat(match[1].replace(/,/g, ''));
          const senderName = this.cleanSenderName(match[2]);
          const memberId = this.extractMemberId(cleanMessage) || senderPhone || 'Unknown';
          
          return {
            senderName,
            amount,
            memberId,
            date: new Date(),
            platform: platformName,
            rawMessage: cleanMessage,
            phoneNumber: senderPhone
          };
        }
      }
      return null;
    };

    // Try M-Pesa patterns first
    let result = tryPatterns(this.patterns.mpesa.confirmation, 'M-Pesa');
    if (result) return result;

    // Try Airtel Money patterns
    result = tryPatterns(this.patterns.airtel.confirmation, 'Airtel Money');
    if (result) return result;

    // Try banking patterns
    result = tryPatterns(this.patterns.banking.confirmation, 'Bank Transfer');
    if (result) return result;

    // Try WhatsApp Pay patterns
    result = tryPatterns(this.patterns.whatsappPay.confirmation, 'WhatsApp Pay');
    if (result) return result;

    // Try international payment patterns
    for (const [platform, patterns] of Object.entries(this.patterns.international)) {
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
      result = tryPatterns(patterns, platformName);
      if (result) return result;
    }

    // Enhanced fallback patterns
    const fallbackPatterns = [
      // Currency first patterns
      /(?:KES|USD|EUR|\$)\s?([\d,]+\.?\d*).+?(?:from|by|sent by)\s+(.+?)(?:\s+via|\s+Member|\s+ID|\.|$)/i,
      // Amount first patterns
      /([\d,]+\.?\d*)\s+(?:KES|USD|EUR|\$).+?(?:from|by|sent by)\s+(.+?)(?:\s+via|\s+Member|\s+ID|\.|$)/i,
      // Person name first with "sent" patterns
      /(.+?)\s+(?:sent|paid|transferred)\s+(?:KES|USD|EUR|\$)?\s?([\d,]+\.?\d*)/i,
      // "received from" patterns  
      /(?:KES|USD|EUR|\$)?\s?([\d,]+\.?\d*)\s+(?:received|got)\s+from\s+(.+?)(?:\s+via|\s+Member|\s+ID|\.|$)/i,
      // Bank transfer specific patterns
      /(?:bank\s+transfer|transfer).*?(?:KES|USD|EUR|\$)?\s?([\d,]+\.?\d*).+?(?:from|by)\s+(.+?)(?:\s+|Account:|ID:|\.|\n|$)/i,
      // Generic payment patterns
      /(?:payment|received|got|sent|transfer).*?([\d,]+\.?\d*).+?(?:from|to|by)\s+(.+?)(?:\s+|Member:|ID:|\.|\n|$)/i
    ];

    for (const pattern of fallbackPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        let amount, senderName;
        
        // Check if first group is amount or name
        if (/^\d/.test(match[1])) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          senderName = this.cleanSenderName(match[2]);
        } else {
          senderName = this.cleanSenderName(match[1]);
          amount = parseFloat(match[2].replace(/,/g, ''));
        }
        
        if (amount > 0) {
          const memberId = this.extractMemberId(cleanMessage) || senderPhone || 'Unknown';
          
          return {
            senderName,
            amount,
            memberId,
            date: new Date(),
            platform: 'Mobile Payment',
            rawMessage: cleanMessage,
            phoneNumber: senderPhone
          };
        }
      }
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
    // Enhanced member ID extraction patterns
    const patterns = [
      // Specific prefixes
      /(?:member|ref|id|account|code|transaction)[\s:]*([A-Z0-9]{3,})/i,
      // Common formats
      /TF[A-Z0-9]{3,}/i,
      /REF[\s:]?([A-Z0-9]{3,})/i,
      /ID[\s:]?([A-Z0-9]{3,})/i,
      /MEMBER[\s:]?([A-Z0-9]{3,})/i,
      /ACCOUNT[\s:]?([A-Z0-9]{3,})/i,
      // M-Pesa specific
      /[A-Z]{2,3}\d{6,}/i,
      // Generic alphanumeric codes
      /\b[A-Z]{2}\d{3,}\b/i,
      /\b[A-Z]{3}\d{2,}\b/i,
      // Phone number as member ID
      /254\d{9}/,
      /\+254\d{9}/
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1] || match[0];
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
    } catch (error: unknown) { const err = error as Error;
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
    } catch (error: unknown) { const err = error as Error;
      console.error('Error sending WhatsApp confirmation:', error);
      return false;
    }
  }
}