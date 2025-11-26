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
      // Verify user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found');
        setError({
          error: 'Sesión expirada. Por favor, inicia sesión de nuevo.',
          code: 'NO_SUBSCRIPTION'
        });
        setTimeout(() => window.location.href = '/login', 2000);
        return null;
      }

      console.log('Starting playback with session:', {
        hasSession: !!session,
        contentId,
        profileId
      });

      const deviceId = getDeviceId();
      
      const { data, error: invokeError } = await supabase.functions.invoke('play', {
        body: { 
          content_id: contentId,
          profile_id: profileId,
          device_id: deviceId 
        }
      });

      console.log('Playback response:', { data, error: invokeError });

      if (invokeError) {
        // Handle 401 Unauthorized - session expired on server
        if (invokeError.message?.includes('401') || invokeError.message?.includes('Unauthorized')) {
          console.error('Session invalid on server, clearing and redirecting to login');
          await supabase.auth.signOut();
          setError({
            error: 'Sesión expirada. Redirigiendo al login...',
            code: 'NO_SUBSCRIPTION'
          });
          setTimeout(() => window.location.href = '/login', 2000);
          return null;
        }
        throw invokeError;
      }
      
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
      
      await supabase.functions.invoke('play', {
        body: { 
          content_id: contentId,
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
