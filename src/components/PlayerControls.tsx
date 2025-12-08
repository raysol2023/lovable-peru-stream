import { memo, useCallback } from 'react';
import { Button } from './ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings 
} from 'lucide-react';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface Quality {
  height: number;
  index: number;
}

interface PlayerControlsProps {
  isPlaying: boolean;
  isLive: boolean;
  showControls: boolean;
  volume: number;
  isMuted: boolean;
  qualities: Quality[];
  currentQuality: number;
  onTogglePlay: () => void;
  onVolumeChange: (values: number[]) => void;
  onToggleMute: () => void;
  onChangeQuality: (levelIndex: number) => void;
  onToggleFullscreen: () => void;
  onGoToLive?: () => void;
}

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
  qualities: Quality[];
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

// Main PlayerControls component - memoized to prevent re-renders from parent time updates
const PlayerControls = memo(function PlayerControls({
  isPlaying,
  isLive,
  showControls,
  volume,
  isMuted,
  qualities,
  currentQuality,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
  onChangeQuality,
  onToggleFullscreen,
  onGoToLive,
}: PlayerControlsProps) {
  return (
    <div 
      data-controls
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 z-20",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            onClick={onTogglePlay}
            className="bg-transparent hover:bg-white/10"
            variant="ghost"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white" />
            )}
          </Button>
          
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />

          {/* LIVE Badge - Clickable to go to current time */}
          {isLive && (
            <Badge 
              variant="destructive" 
              className="cursor-pointer hover:bg-red-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onGoToLive?.();
              }}
            >
              EN VIVO
            </Badge>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <QualitySettings
            qualities={qualities}
            currentQuality={currentQuality}
            onChangeQuality={onChangeQuality}
          />

          <Button
            size="icon"
            onClick={onToggleFullscreen}
            className="bg-transparent hover:bg-white/10"
            variant="ghost"
          >
            <Maximize className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default PlayerControls;
