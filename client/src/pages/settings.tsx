import { Campaign } from '../types/campaign';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useLocation } from 'wouter';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  googleSheetUrl: z.string().optional(),
});

const sheetsSchema = z.object({
  sheetUrl: z.string().url('Please enter a valid Google Sheets URL'),
});

const whatsappSchema = z.object({
  accessToken: z.string().min(1, 'Access Token is required'),
  verifyToken: z.string().min(1, 'Verify Token is required'), 
  phoneNumberId: z.string().min(1, 'Phone Number ID is required'),
  businessAccountId: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;
type SheetsFormData = z.infer<typeof sheetsSchema>;
type WhatsAppFormData = z.infer<typeof whatsappSchema>;

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeCampaign } = useQuery({
    queryKey: ['/api/campaigns/active'],
  });

  const campaignForm = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: activeCampaign?.name || '',
      startDate: activeCampaign?.startDate ? new Date(activeCampaign.startDate).toISOString().split('T')[0] : '',
      endDate: activeCampaign?.endDate ? new Date(activeCampaign.endDate).toISOString().split('T')[0] : '',
      googleSheetUrl: activeCampaign?.googleSheetUrl || '',
    },
  });

  const sheetsForm = useForm<SheetsFormData>({
    resolver: zodResolver(sheetsSchema),
    defaultValues: {
      sheetUrl: '',
    },
  });

  const whatsappForm = useForm<WhatsAppFormData>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      accessToken: '',
      verifyToken: '',
      phoneNumberId: '',
      businessAccountId: '',
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      if (!activeCampaign?.id) {
        throw new Error('No active campaign found');
      }
      return apiRequest('PUT', `/api/campaigns/${activeCampaign.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Campaign updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/active'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const syncSheets = useMutation({
    mutationFn: async (data: SheetsFormData) => {
      return apiRequest('POST', '/api/sheets/sync', data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Google Sheets URL updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/active'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateWhatsApp = useMutation({
    mutationFn: async (data: WhatsAppFormData) => {
      const config = {
        ...data,
        webhookUrl: '/api/webhooks/whatsapp'
      };
      return apiRequest('PUT', '/api/api-configs/4', {
        config: JSON.stringify(config),
        isActive: true
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'WhatsApp API configured successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/api-configs'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onCampaignSubmit = (data: CampaignFormData) => {
    updateCampaign.mutate(data);
  };

  const onSheetsSubmit = (data: SheetsFormData) => {
    syncSheets.mutate(data);
  };

  const onWhatsAppSubmit = (data: WhatsAppFormData) => {
    updateWhatsApp.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-medium">Settings</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="px-4 py-6">
        <Tabs defaultValue="campaign" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="campaign" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
                <CardDescription>
                  Configure your current campaign details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={campaignForm.handleSubmit(onCampaignSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter campaign name"
                      {...campaignForm.register('name')}
                    />
                    {campaignForm.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {campaignForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...campaignForm.register('startDate')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...campaignForm.register('endDate')}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={updateCampaign.isPending}>
                    {updateCampaign.isPending ? 'Updating...' : 'Update Campaign'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Google Sheets Integration</CardTitle>
                <CardDescription>
                  Connect your Google Sheets for automatic data sync
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={sheetsForm.handleSubmit(onSheetsSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="sheetUrl">Google Sheets URL</Label>
                    <Input
                      id="sheetUrl"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      {...sheetsForm.register('sheetUrl')}
                    />
                    {sheetsForm.formState.errors.sheetUrl && (
                      <p className="text-sm text-red-600 mt-1">
                        {sheetsForm.formState.errors.sheetUrl.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={syncSheets.isPending}>
                    {syncSheets.isPending ? 'Syncing...' : 'Update Sheets URL'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Configurations</CardTitle>
                <CardDescription>
                  Manage your API connections and webhooks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS API</p>
                    <p className="text-sm text-gray-600">Twilio/Africa's Talking integration</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Gmail API</p>
                    <p className="text-sm text-gray-600">Email notification parsing</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">M-Pesa Webhook</p>
                    <p className="text-sm text-gray-600">Real-time M-Pesa notifications</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">WhatsApp Business API</p>
                    <p className="text-sm text-gray-600">WhatsApp payment notifications</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business API Configuration</CardTitle>
                <CardDescription>
                  Set up WhatsApp Business API for receiving payment notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={whatsappForm.handleSubmit(onWhatsAppSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      placeholder="WhatsApp Business API Access Token"
                      {...whatsappForm.register('accessToken')}
                    />
                    {whatsappForm.formState.errors.accessToken && (
                      <p className="text-sm text-red-600 mt-1">
                        {whatsappForm.formState.errors.accessToken.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="verifyToken">Verify Token</Label>
                    <Input
                      id="verifyToken"
                      placeholder="Webhook verification token"
                      {...whatsappForm.register('verifyToken')}
                    />
                    {whatsappForm.formState.errors.verifyToken && (
                      <p className="text-sm text-red-600 mt-1">
                        {whatsappForm.formState.errors.verifyToken.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      placeholder="WhatsApp Business Phone Number ID"
                      {...whatsappForm.register('phoneNumberId')}
                    />
                    {whatsappForm.formState.errors.phoneNumberId && (
                      <p className="text-sm text-red-600 mt-1">
                        {whatsappForm.formState.errors.phoneNumberId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="businessAccountId">Business Account ID (Optional)</Label>
                    <Input
                      id="businessAccountId"
                      placeholder="WhatsApp Business Account ID"
                      {...whatsappForm.register('businessAccountId')}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Webhook URL</h4>
                    <p className="text-sm text-blue-700 font-mono bg-blue-100 p-2 rounded">
                      {window.location.origin}/api/webhooks/whatsapp
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Use this URL in your WhatsApp Business API webhook configuration
                    </p>
                  </div>

                  <Button type="submit" disabled={updateWhatsApp.isPending}>
                    {updateWhatsApp.isPending ? 'Configuring...' : 'Save WhatsApp Configuration'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">Real-time contribution alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Daily summary emails</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Critical alerts via SMS</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
