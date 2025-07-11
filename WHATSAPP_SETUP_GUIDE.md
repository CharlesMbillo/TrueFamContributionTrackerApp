# WhatsApp Business API Setup Guide for TRUEFAM Contribution Tracker

This guide will help you set up WhatsApp Business API integration to automatically process payment notifications sent via WhatsApp messages.

## Prerequisites

1. **WhatsApp Business Account**: You need a verified WhatsApp Business account
2. **Facebook Business Manager**: Access to Facebook Business Manager  
3. **Meta Developer Account**: Developer access to create and manage apps

## Step 1: Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in your app details:
   - App Name: "TRUEFAM Contribution Tracker"
   - Contact Email: Your business email
   - Business Account: Select your business account

## Step 2: Add WhatsApp Business Product

1. In your Meta app dashboard, click "Add Product"
2. Find "WhatsApp Business" and click "Set up"
3. Follow the setup wizard to configure your business

## Step 3: Get Your Credentials

### Access Token
1. In WhatsApp Business setup, go to "API Setup"
2. Copy the temporary access token
3. For production, generate a permanent token

### Phone Number ID  
1. In the "API Setup" section
2. Find your phone number and copy the Phone Number ID
3. This identifies which WhatsApp number receives webhooks

### Verify Token
1. Create a secure random string (e.g., `TF_webhook_2024_secure`)
2. This will be used to verify webhook requests

### Business Account ID (Optional)
1. Found in your WhatsApp Business Account settings
2. Used for advanced business features

## Step 4: Configure Webhooks

1. In WhatsApp Business API setup, go to "Configuration" → "Webhooks"
2. Set the webhook URL to: `https://your-replit-domain.repl.it/api/webhooks/whatsapp`
3. Set the verify token to your chosen secure string
4. Subscribe to these webhook fields:
   - `messages` (required for payment notifications)
   - `message_status` (optional for delivery tracking)

## Step 5: Configure TRUEFAM App

1. Open your TRUEFAM app settings
2. Go to Integrations → WhatsApp Business API Configuration
3. Fill in the form with your credentials:
   - **Access Token**: From Step 3
   - **Verify Token**: From Step 3  
   - **Phone Number ID**: From Step 3
   - **Business Account ID**: From Step 3 (optional)

## Step 6: Test the Integration

Send a test message to your WhatsApp Business number with payment notification format:

```
Received KES 1,500 from John Doe via M-Pesa. Member ID: TF001. Transaction ID: QCH7XYZ123
```

The system supports these payment platforms:
- **M-Pesa**: `Received KES 1,500 from John Doe via M-Pesa. Member ID: TF001`
- **Airtel Money**: `Got KES 2,750 from Mary Jane via Airtel Money. Ref: AM789XYZ`  
- **Zelle**: `Payment of $25 received from Robert Smith via Zelle. Member: TF003`
- **Venmo**: `$50 received from Alice Johnson via Venmo. ID: TF004`
- **Bank Transfer**: `Bank transfer KES 3,000 from Peter Wilson. Account: TF005`

## Webhook Verification

The app automatically handles webhook verification. When Meta sends verification requests, the system:

1. Checks the `hub.mode` parameter equals "subscribe"
2. Verifies the `hub.verify_token` matches your configured token
3. Returns the `hub.challenge` to confirm the webhook

## Message Processing Flow

1. **Receive**: WhatsApp message sent to your business number
2. **Parse**: Extract payment details (amount, sender, member ID, platform)
3. **Store**: Save contribution to database with campaign association  
4. **Sync**: Automatically update Google Sheets (if configured)
5. **Notify**: Send real-time updates to connected app clients
6. **Confirm**: Optional confirmation message back to sender

## Supported Message Formats

The parser recognizes various payment notification formats:

### M-Pesa Formats
- `Received KES 1,500 from John Doe via M-Pesa. Member ID: TF001`
- `KES 2,000 confirmed from Mary Jane. Transaction: MP123XYZ`
- `M-Pesa payment KES 500 from Peter Smith. Ref: TF002`

### International Formats  
- `Payment of $25 received from Robert Smith via Zelle. Member: TF003`
- `$50 received from Alice via Venmo. ID: TF004`
- `PayPal payment $75 from Bob Wilson. Account: TF005`

### Bank Transfers
- `Bank transfer KES 3,000 from Sarah Connor. Reference: TF006`
- `Received KES 1,200 via bank transfer from James Bond. Account: TF007`

## Troubleshooting

### Webhook Not Receiving Messages
1. Check webhook URL is publicly accessible
2. Verify webhook subscription in Meta dashboard
3. Ensure verify token matches exactly
4. Check app logs for error messages

### Messages Not Being Parsed
1. Check system logs for parsing failures
2. Ensure message contains amount and sender name
3. Verify member ID format (TF + alphanumeric)
4. Test with supported message formats

### Permission Issues
1. Verify WhatsApp Business API permissions
2. Check access token validity and permissions
3. Ensure phone number is verified and active

## Security Best Practices

1. **Secure Tokens**: Keep access tokens and verify tokens secure
2. **HTTPS Only**: Always use HTTPS for webhook URLs
3. **Token Rotation**: Regularly rotate access tokens
4. **Webhook Verification**: Always verify webhook authenticity
5. **Rate Limiting**: Implement rate limiting for webhook endpoints

## Production Deployment

For production use:

1. **Permanent Access Token**: Generate long-lived access tokens
2. **Custom Domain**: Use a custom domain for webhook URLs
3. **SSL Certificate**: Ensure valid SSL certificate
4. **Monitoring**: Set up logging and monitoring
5. **Backup**: Regular database backups
6. **Rate Limits**: Monitor API rate limits

## Support

For issues with:
- **Meta/WhatsApp API**: Check Meta Developer Documentation
- **TRUEFAM App**: Check system logs in the app's Logs section
- **Webhook Issues**: Test webhook with Meta's testing tools

The TRUEFAM Contribution Tracker logs all webhook activity, making it easy to debug integration issues.