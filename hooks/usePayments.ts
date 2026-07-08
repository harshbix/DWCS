import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { toast } from '@/utils/toast';
import type { Bill, PaymentPayload } from '@/types/database';

/**
 * Hook to retrieve municipal billing details and issue payment transactions.
 */
export function usePayments(citizenId?: string) {
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  // Query billing list
  const { data: bills = [], isLoading, error, refetch } = useQuery<Bill[]>({
    queryKey: ['billing', citizenId],
    queryFn: async () => {
      let query = supabase
        .from('billing')
        .select('*, payment_transactions(*)')
        .is('deleted_at', null)
        .order('due_date', { ascending: false });

      if (citizenId) {
        query = query.eq('citizen_id', citizenId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Bill[];
    },
    staleTime: 60 * 1000,
  });

  // Mutation to submit payment transaction via RPC
  const makePayment = useMutation({
    mutationFn: async (payload: PaymentPayload) => {
      const { error } = await supabase.rpc('v1_submit_payment', {
        p_billing_id: payload.billingId,
        p_amount: payload.amount,
        p_transaction_reference: payload.transactionReference,
        p_provider: payload.provider,
        p_payment_method: payload.paymentMethod,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Payment Received', 'Invoice paid successfully.');
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      queryClient.invalidateQueries({ queryKey: ['citizen-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: any) => {
      toast.error('Payment Failed', error.message || 'Error occurred during payment processing.');
    },
  });

  return {
    bills,
    isLoading,
    error,
    refetch,
    makePayment,
  };
}
export type { PaymentPayload };
export type { Bill };
