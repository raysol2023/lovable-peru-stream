import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { mockTitles } from '@/data/mockData';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const title = mockTitles.find(t => t.id === id);

  if (!title) {
    return <div>Título no encontrado</div>;
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
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
              {title.year} • {title.genres.join(', ')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative bg-black">
        <img 
          src={title.thumbnail}
          alt={title.title}
          className="max-h-full object-contain opacity-50"
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-4">
              <Play className="h-24 w-24 mx-auto opacity-50" />
            </div>
            <p className="text-xl mb-2">Video de demostración</p>
            <p className="text-sm text-white/60">
              Esta es una vista previa del reproductor
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="mb-4">
          <div className="h-1 bg-white/30 rounded-full">
            <div className="h-1 bg-primary w-1/3 rounded-full" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <span className="text-white text-sm">
              12:34 / 1:45:20
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
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
