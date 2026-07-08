import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { toast } from '@/utils/toast';
import type { Complaint, ComplaintPayload } from '@/types/database';

/**
 * Hook targeting citizen/admin complaints queries, file uploads, and mutations.
 */
export function useComplaints(citizenId?: string) {
  const supabase = createBrowserSupabaseClient();
  const queryClient = useQueryClient();

  // Query complaints list
  const { data: complaints = [], isLoading, error, refetch } = useQuery<Complaint[]>({
    queryKey: ['complaints', citizenId],
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select('*, citizens(profiles(full_name, phone))')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (citizenId) {
        query = query.eq('citizen_id', citizenId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Complaint[];
    },
    staleTime: 60 * 1000,
  });

  // Mutation to submit a new complaint + upload media object
  const submitComplaint = useMutation({
    mutationFn: async (payload: ComplaintPayload) => {
      // 1. Insert complaint record
      const { data: complaint, error: compError } = await supabase
        .from('complaints')
        .insert({
          citizen_id: payload.citizenId,
          complaint_type: payload.complaintType,
          description: payload.description,
          latitude: payload.latitude,
          longitude: payload.longitude,
          priority: payload.priority ?? 'medium',
        })
        .select()
        .single();

      if (compError) throw compError;
      if (!complaint) throw new Error('Complaint was not created.');

      // 2. Upload image asset if provided
      if (payload.imageFile) {
        // organization_id is set by the database trigger/RLS, read it from the returned row
        const organizationId = (complaint as { organization_id?: string }).organization_id;

        if (!organizationId) {
          // Do NOT write to storage with a fake org — skip upload and warn
          toast.info(
            'Photo Skipped',
            'Organization data unavailable. Complaint filed without photo.'
          );
        } else {
          const extension = payload.imageFile.name.split('.').pop();
          const objectPath = `${organizationId}/${payload.citizenId}/${complaint.id}/${Date.now()}.${extension}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('complaints')
            .upload(objectPath, payload.imageFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // 3. Insert generic file metadata record
          const { error: fileError } = await supabase.from('files').insert({
            organization_id: organizationId,
            entity_type: 'complaints',
            entity_id: complaint.id,
            bucket: 'complaints',
            object_path: uploadData.path,
            file_name: payload.imageFile.name,
            mime_type: payload.imageFile.type,
            size: payload.imageFile.size,
          });

          if (fileError) throw fileError;
        }
      }

      return complaint;
    },
    onSuccess: () => {
      toast.success('Report Filed', 'Your complaint has been submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['citizen-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err: Error) => {
      toast.error('Submission Failed', err.message || 'Error occurred while filing complaint.');
    },
  });

  return {
    complaints,
    isLoading,
    error,
    refetch,
    submitComplaint,
  };
}
