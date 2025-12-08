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
      const now = new Date().toISOString();
      
      // Single optimized query using Supabase relations
      // Fetches channels with their current EPG program in ONE request
      const { data: channels, error } = await supabase
        .from('content')
        .select(`
          *,
          epg_data!epg_data_channel_id_fkey (
            program_title,
            start_time,
            end_time
          )
        `)
        .eq('is_tv', true)
        .order('title', { ascending: true });

      if (error) throw error;

      // Transform the data to match expected format and filter current programs
      const channelsWithPrograms: LiveChannel[] = (channels || []).map((channel: any) => {
        // Find current program from the EPG data
        const epgPrograms = channel.epg_data || [];
        const currentProgram = epgPrograms.find((program: any) => {
          const startTime = new Date(program.start_time);
          const endTime = new Date(program.end_time);
          const nowDate = new Date(now);
          return startTime <= nowDate && endTime >= nowDate;
        });

        // Remove epg_data from the channel object and add current_program
        const { epg_data, ...channelData } = channel;
        
        return {
          ...channelData,
          current_program: currentProgram ? {
            title: currentProgram.program_title,
            start_time: currentProgram.start_time,
            end_time: currentProgram.end_time,
          } : undefined,
        } as LiveChannel;
      });

      return channelsWithPrograms;
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });
}
