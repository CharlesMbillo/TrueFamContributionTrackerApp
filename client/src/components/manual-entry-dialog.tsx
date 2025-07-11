import { Campaign } from '../types/campaign';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  senderName: z.string().min(1, 'Sender name is required'),
  amount: z.string().min(1, 'Amount is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  platform: z.string().min(1, 'Platform is required'),
});

type FormData = z.infer<typeof formSchema>;

interface ManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManualEntryDialog({ open, onOpenChange }: ManualEntryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeCampaign } = useQuery({
    queryKey: ['/api/campaigns/active'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderName: '',
      amount: '',
      memberId: '',
      platform: '',
    },
  });

  const createContribution = useMutation({
    mutationFn: async (data: FormData) => {
      if (!activeCampaign?.id) {
        throw new Error('No active campaign found');
      }

      return apiRequest('POST', '/api/contributions', {
        ...data,
        campaignId: activeCampaign.id,
        date: new Date().toISOString(),
        source: 'MANUAL',
        rawMessage: `Manual entry: ${data.senderName} - ${data.amount} - ${data.memberId}`,
        processed: true,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Contribution added successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contributions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contributions/stats'] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createContribution.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Manual Entry</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="senderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter sender name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (KES)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="Enter amount" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter member ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                      <SelectItem value="Airtel">Airtel Money</SelectItem>
                      <SelectItem value="Zelle">Zelle</SelectItem>
                      <SelectItem value="Venmo">Venmo</SelectItem>
                      <SelectItem value="Cash App">Cash App</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createContribution.isPending}>
                {createContribution.isPending ? 'Adding...' : 'Add Contribution'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
