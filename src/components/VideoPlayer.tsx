import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import Hls from 'hls.js';
import { Button } from './ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, ChevronLeft } from 'lucide-react';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface VideoPlayerProps {
  manifestUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  autoPlay?: boolean;
  isLive?: boolean;
  channelTitle?: string;
  currentProgramTitle?: string;
  onBack?: () => void;
}

// Memoized Header Component - prevents re-render on time updates
const PlayerHeader = memo(function PlayerHeader({
  showControls,
  onBack,
  currentProgramTitle,
  channelTitle,
}: {
  showControls: boolean;
  onBack?: () => void;
  currentProgramTitle?: string;
  channelTitle?: string;
}) {
  return (
    <div 
      className={cn(
        "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 z-20",
        showControls ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="bg-transparent hover:bg-white/10 rounded-full"
            variant="ghost"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-white text-xl font-semibold">
            {currentProgramTitle || channelTitle || 'En Vivo'}
          </h1>
          {currentProgramTitle && channelTitle && (
            <Badge variant="destructive" className="w-fit text-xs">
              {channelTitle}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});

// Memoized Volume Slider Component
const VolumeControl = memo(function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (values: number[]) => void;
  onToggleMute: () => void;
}) {
  return (
    <div className="flex items-center gap-2 group/volume">
      <Button
        size="icon"
        onClick={onToggleMute}
        className="bg-transparent hover:bg-white/10"
        variant="ghost"
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="h-5 w-5 text-white" />
        ) : (
          <Volume2 className="h-5 w-5 text-white" />
        )}
      </Button>
      <div className="w-0 group-hover/volume:w-20 transition-all duration-200 overflow-hidden">
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
          className="w-20"
        />
      </div>
    </div>
  );
});

// Memoized Quality Settings Component
const QualitySettings = memo(function QualitySettings({
  qualities,
  currentQuality,
  onChangeQuality,
}: {
  qualities: Array<{ height: number; index: number }>;
  currentQuality: number;
  onChangeQuality: (levelIndex: number) => void;
}) {
  if (qualities.length === 0) return null;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="bg-transparent hover:bg-white/10"
          variant="ghost"
        >
          <Settings className="h-5 w-5 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 bg-black/95 border-white/20 text-white">
        <div className="space-y-2">
          <p className="text-sm font-semibold mb-2">Calidad</p>
          <Button
            onClick={() => onChangeQuality(-1)}
            variant="ghost"
            className={cn(
              "w-full justify-start text-sm",
              currentQuality === -1 && "bg-white/20"
            )}
          >
            Auto
          </Button>
          {qualities.map((quality) => (
            <Button
              key={quality.index}
              onClick={() => onChangeQuality(quality.index)}
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm",
                currentQuality === quality.index && "bg-white/20"
              )}
            >
              {quality.height}p
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

export function VideoPlayer({ 
  manifestUrl, 
  onTimeUpdate, 
  onDurationChange,
  autoPlay = true,
  isLive = false,
  channelTitle,
  currentProgramTitle,
  onBack
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualities, setQualities] = useState<Array<{ height: number; index: number }>>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showCenterPlayPause, setShowCenterPlayPause] = useState(false);

  // Memoized callbacks to prevent child re-renders
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const handleVolumeChange = useCallback((values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
        if (volume === 0) setVolume(0.5);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const changeQuality = useCallback((levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  }, []);

  const goToLive = useCallback(() => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    
    if (video && hls && isLive) {
      const duration = video.duration;
      if (duration && isFinite(duration)) {
        video.currentTime = duration;
      }
    }
  }, [isLive]);

  const handleVideoClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-controls]')) return;
    
    togglePlay();
    setShowCenterPlayPause(true);
    setTimeout(() => setShowCenterPlayPause(false), 600);
  }, [togglePlay]);

  const handleDoubleClick = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Auto-hide controls
  useEffect(() => {
    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3500);
    };

    const handleMouseMove = () => resetTimeout();
    const handleTouchStart = () => resetTimeout();

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchstart', handleTouchStart);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchstart', handleTouchStart);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(manifestUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const availableQualities = data.levels.map((level, index) => ({
          height: level.height,
          index
        }));
        setQualities(availableQualities);
        setCurrentQuality(hls.currentLevel);

        if (autoPlay) {
          video.play().catch(err => {
            console.error('Autoplay failed:', err);
            setIsPlaying(false);
          });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Error de red al cargar el video');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Error de reproducción');
              hls.recoverMediaError();
              break;
            default:
              setError('Error crítico al reproducir el video');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
      if (autoPlay) {
        video.play().catch(err => {
          console.error('Autoplay failed:', err);
          setIsPlaying(false);
        });
      }
    } else {
      setError('Tu navegador no soporta reproducción HLS');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [manifestUrl, autoPlay]);

  // Video event listeners - optimized to not cause re-renders
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use refs for callbacks to avoid re-renders
    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime);
    };

    const handleDurationChange = () => {
      onDurationChange?.(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onDurationChange]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Memoized center play/pause indicator
  const centerPlayPauseIndicator = useMemo(() => {
    if (!showCenterPlayPause) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-full bg-black/60 backdrop-blur-sm p-8">
          {isPlaying ? (
            <Pause className="h-16 w-16 text-white" fill="white" />
          ) : (
            <Play className="h-16 w-16 text-white" fill="white" />
          )}
        </div>
      </div>
    );
  }, [showCenterPlayPause, isPlaying]);

  // Memoized paused overlay
  const pausedOverlay = useMemo(() => {
    if (isPlaying || showCenterPlayPause) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors z-10 pointer-events-none">
        <div className="rounded-full bg-background/20 backdrop-blur-sm p-6">
          <Play className="h-12 w-12 text-white" fill="white" />
        </div>
      </div>
    );
  }, [isPlaying, showCenterPlayPause]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-lg mb-2">⚠️ {error}</p>
          <p className="text-sm text-gray-400">Por favor, intenta de nuevo más tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onClick={handleVideoClick}
      onDoubleClick={handleDoubleClick}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />
      
      {/* Disney+ Style Header - Memoized */}
      <PlayerHeader 
        showControls={showControls}
        onBack={onBack}
        currentProgramTitle={currentProgramTitle}
        channelTitle={channelTitle}
      />

      {/* Center Play/Pause Icon - Memoized */}
      {centerPlayPauseIndicator}
      
      {/* Center Play Button (when paused) - Memoized */}
      {pausedOverlay}

      {/* Live Progress Bar (non-navigable) */}
      {isLive && (
        <div 
          className={cn(
            "absolute bottom-16 left-0 right-0 px-4 transition-opacity duration-300 z-20",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 w-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div 
        data-controls
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 z-20",
          showControls ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              onClick={togglePlay}
              className="bg-transparent hover:bg-white/10"
              variant="ghost"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" fill="white" />
              ) : (
                <Play className="h-5 w-5 text-white" fill="white" />
              )}
            </Button>

            {isLive && (
              <Button
                onClick={goToLive}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 h-auto text-xs font-semibold flex items-center gap-1.5"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                EN VIVO
              </Button>
            )}
          </div>

          {/* Right Controls - Memoized children */}
          <div className="flex items-center gap-3">
            <VolumeControl 
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
            />

            <QualitySettings
              qualities={qualities}
              currentQuality={currentQuality}
              onChangeQuality={changeQuality}
            />

            {/* Fullscreen */}
            <Button
              size="icon"
              onClick={toggleFullscreen}
              className="bg-transparent hover:bg-white/10"
              variant="ghost"
            >
              <Maximize className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
