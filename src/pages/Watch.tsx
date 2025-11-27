import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContentById } from '@/hooks/useContent';
import { usePlaybackSession } from '@/hooks/usePlaybackSession';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useEPG } from '@/hooks/useEPG';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PlaybackErrorDialog } from '@/components/PlaybackErrorDialog';

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profileId } = useActiveProfile();
  const { data: content, isLoading: contentLoading } = useContentById(id || '');
  const { data: epgPrograms } = useEPG(content?.is_tv ? id || null : null);
  const { startPlayback, sendHeartbeat, loading, error } = usePlaybackSession();
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Get current program from EPG
  const currentProgram = useMemo(() => {
    if (!epgPrograms || epgPrograms.length === 0) return null;
    
    const now = new Date();
    return epgPrograms.find(program => {
      const start = new Date(program.start_time);
      const end = new Date(program.end_time);
      return now >= start && now <= end;
    });
  }, [epgPrograms]);

  // Start playback session
  useEffect(() => {
    if (!id || !profileId || !content) return;

    const initPlayback = async () => {
      const session = await startPlayback(id, profileId);
      if (session) {
        // Backend already provides the correct URL (proxied if needed)
        setManifestUrl(session.manifest_url);
      } else {
        setShowError(true);
      }
    };

    initPlayback();
  }, [id, profileId, content]);

  // Heartbeat every 2 minutes
  useEffect(() => {
    if (!id || !profileId || !manifestUrl) return;

    const interval = setInterval(() => {
      sendHeartbeat(id, profileId);
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [id, profileId, manifestUrl, sendHeartbeat]);

  if (contentLoading || loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <p className="text-white">Cargando contenido...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Contenido no encontrado</p>
          <Button onClick={() => navigate('/home')} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-screen bg-black overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm opacity-30"
          style={{ backgroundImage: `url(${content.cover_image_url})` }}
        />

        {/* Video Player */}
        {manifestUrl ? (
          <VideoPlayer 
            manifestUrl={manifestUrl}
            autoPlay={true}
            isLive={content.is_tv}
            channelTitle={content.title}
            currentProgramTitle={currentProgram?.program_title}
            onBack={() => navigate(-1)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-lg">Iniciando reproducción...</p>
          </div>
        )}
      </div>

      {/* Error Dialog */}
      <PlaybackErrorDialog 
        error={showError ? error : null}
        onClose={() => {
          setShowError(false);
          navigate('/home');
        }}
        onRetry={() => {
          setShowError(false);
          if (id && profileId) {
            startPlayback(id, profileId).then(session => {
              if (session) setManifestUrl(session.manifest_url);
              else setShowError(true);
            });
          }
        }}
      />
    </>
  );
}
