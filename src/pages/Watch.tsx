import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, Subtitles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { mockTitles } from '@/data/mockData';
import { Slider } from '@/components/ui/slider';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(6320); // 1:45:20 in seconds
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  
  const title = mockTitles.find(t => t.id === id);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration - 30) {
            setShowNextEpisode(true);
          }
          return prev < duration ? prev + 1 : duration;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  if (!title) {
    return <div>Título no encontrado</div>;
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(duration, prev + seconds)));
  };

  return (
    <div className="h-screen bg-black flex flex-col relative group">
      <div 
        className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{title.title}</h1>
            <p className="text-sm text-white/80">
              {title.type === 'series' ? 'T1:E1 - ' : ''}{title.year} • {title.genres.join(', ')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        <img 
          src={title.thumbnail}
          alt={title.title}
          className="max-h-full object-contain opacity-30 blur-sm"
        />
        
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="icon"
              onClick={() => setIsPlaying(true)}
              className="h-20 w-20 rounded-full shadow-glow hover:scale-110 transition-transform"
            >
              <Play className="h-10 w-10 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {showNextEpisode && title.type === 'series' && (
        <div className="absolute top-1/2 right-8 -translate-y-1/2 bg-card/95 backdrop-blur-sm rounded-lg p-4 w-80 shadow-glow animate-fade-in">
          <p className="text-sm text-muted-foreground mb-2">Siguiente episodio</p>
          <h3 className="font-semibold mb-3">T1:E2 - El Secreto Revelado</h3>
          <Button 
            className="w-full shadow-glow"
            onClick={() => navigate(`/watch/${id}`)}
          >
            <Play className="h-4 w-4 mr-2" />
            Reproducir Ahora
          </Button>
        </div>
      )}

      <div 
        className={`absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="mb-4 group/progress">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => handleSkip(-10)}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => handleSkip(10)}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <div className="w-24">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(val) => {
                    setVolume(val[0]);
                    setIsMuted(val[0] === 0);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Subtitles className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => document.documentElement.requestFullscreen()}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
