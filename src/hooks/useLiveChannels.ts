import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Content } from '@/types/content';

export function useLiveChannels() {
  return useQuery({
    queryKey: ['content', 'live-tv'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('is_tv', true)
        .order('title', { ascending: true });

      if (error) throw error;
      return data as Content[];
    }
  });
}
