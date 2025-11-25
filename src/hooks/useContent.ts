import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Content } from '@/types/content';

export function useContent() {
  return useQuery({
    queryKey: ['content', 'vod'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('is_tv', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Content[];
    }
  });
}

export function useContentById(id: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Content;
    },
    enabled: !!id
  });
}
