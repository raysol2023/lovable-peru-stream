import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/utils/deviceId';
import { PlaybackSession, PlaybackError } from '@/types/playback';

export function usePlaybackSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PlaybackError | null>(null);

  const startPlayback = async (contentId: string, profileId: string): Promise<PlaybackSession | null> => {
    setLoading(true);
    setError(null);

    try {
      const deviceId = getDeviceId();
      
      const { data, error: invokeError } = await supabase.functions.invoke(`play/${contentId}`, {
        body: { 
          profile_id: profileId,
          device_id: deviceId 
        }
      });

      if (invokeError) throw invokeError;
      
      if (data?.error) {
        setError(data as PlaybackError);
        return null;
      }

      return data as PlaybackSession;
    } catch (err: any) {
      console.error('Playback error:', err);
      setError({
        error: err.message || 'Error al iniciar reproducción',
        code: 'NO_SUBSCRIPTION'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendHeartbeat = async (contentId: string, profileId: string) => {
    try {
      const deviceId = getDeviceId();
      
      await supabase.functions.invoke(`play/${contentId}`, {
        body: { 
          profile_id: profileId,
          device_id: deviceId 
        }
      });
    } catch (err) {
      console.error('Heartbeat error:', err);
    }
  };

  return { startPlayback, sendHeartbeat, loading, error };
}
