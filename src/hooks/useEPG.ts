import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EPGProgram {
  id: string;
  channel_id: string;
  program_title: string;
  program_description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  genre: string | null;
  rating: string | null;
}

export function useEPG(channelId: string | null, date?: Date) {
  return useQuery({
    queryKey: ['epg', channelId, date?.toDateString()],
    queryFn: async () => {
      if (!channelId) return [];

      const startOfDay = date ? new Date(date) : new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('epg_data')
        .select('*')
        .eq('channel_id', channelId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as EPGProgram[];
    },
    enabled: !!channelId,
  });
}
