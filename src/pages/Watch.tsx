import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContentById } from '@/hooks/useContent';
import { usePlaybackSession } from '@/hooks/usePlaybackSession';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PlaybackErrorDialog } from '@/components/PlaybackErrorDialog';

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profileId } = useActiveProfile();
  const { data: content, isLoading: contentLoading } = useContentById(id || '');
  const { startPlayback, sendHeartbeat, loading, error } = usePlaybackSession();
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Start playback session
  useEffect(() => {
    if (!id || !profileId || !content) return;

    const initPlayback = async () => {
      const session = await startPlayback(id, profileId);
      if (session) {
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
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Video Player */}
        {manifestUrl ? (
          <VideoPlayer 
            manifestUrl={manifestUrl}
            autoPlay={true}
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
