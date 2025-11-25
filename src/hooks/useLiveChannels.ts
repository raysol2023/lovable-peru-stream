import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Content } from '@/types/content';

export interface LiveChannel extends Content {
  current_program?: {
    title: string;
    start_time: string;
    end_time: string;
  };
}

export function useLiveChannels() {
  return useQuery({
    queryKey: ['content', 'live-tv'],
    queryFn: async () => {
      const { data: channels, error } = await supabase
        .from('content')
        .select('*')
        .eq('is_tv', true)
        .order('title', { ascending: true });

      if (error) throw error;

      // Get current program for each channel
      const now = new Date().toISOString();
      const channelsWithPrograms = await Promise.all(
        (channels as Content[]).map(async (channel) => {
          const { data: currentProgram } = await supabase
            .from('epg_data')
            .select('program_title, start_time, end_time')
            .eq('channel_id', channel.id)
            .lte('start_time', now)
            .gte('end_time', now)
            .maybeSingle();

          return {
            ...channel,
            current_program: currentProgram ? {
              title: currentProgram.program_title,
              start_time: currentProgram.start_time,
              end_time: currentProgram.end_time,
            } : undefined,
          } as LiveChannel;
        })
      );

      return channelsWithPrograms;
    }
  });
}
