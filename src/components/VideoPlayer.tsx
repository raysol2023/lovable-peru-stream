import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Button } from './ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  manifestUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  autoPlay?: boolean;
  isLive?: boolean;
}

export function VideoPlayer({ 
  manifestUrl, 
  onTimeUpdate, 
  onDurationChange,
  autoPlay = true,
  isLive = false
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

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
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
  };

  const toggleFullscreen = async () => {
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
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const isLeftSide = clickX < rect.width / 2;
    
    toggleFullscreen();
  };

  const goToLive = () => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    
    if (video && hls && isLive) {
      // For live streams, seek to the live edge
      const duration = video.duration;
      if (duration && isFinite(duration)) {
        video.currentTime = duration;
      }
    }
  };

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  };

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
      onDoubleClick={handleDoubleClick}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />
      
      {/* Center Play Button */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors z-10">
          <Button
            size="lg"
            onClick={togglePlay}
            className="rounded-full w-20 h-20 bg-background/20 hover:bg-background/30 backdrop-blur-sm"
            variant="ghost"
          >
            <Play className="h-10 w-10 text-white" fill="white" />
          </Button>
        </div>
      )}

      {/* Controls Bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 z-20",
          showControls ? "opacity-100" : "opacity-0"
        )}
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

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div className="flex items-center gap-2 group/volume">
              <Button
                size="icon"
                onClick={toggleMute}
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
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            {/* Quality Settings */}
            {qualities.length > 0 && (
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
                      onClick={() => changeQuality(-1)}
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
                        onClick={() => changeQuality(quality.index)}
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
            )}

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
