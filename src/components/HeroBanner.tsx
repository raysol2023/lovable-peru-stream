import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Content } from '@/types/content';
import { useNavigate } from 'react-router-dom';
import { optimizeImageUrl, IMAGE_PRESETS } from '@/utils/imageOptimizer';

interface HeroBannerProps {
  title?: Content;
}

export function HeroBanner({ title }: HeroBannerProps) {
  const navigate = useNavigate();

  if (!title) {
    return (
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full overflow-hidden bg-gradient-to-b from-background to-muted">
        <div className="relative h-full flex items-center justify-center">
          <p className="text-muted-foreground">Cargando contenido destacado...</p>
        </div>
      </div>
    );
  }

  const optimizedImageUrl = optimizeImageUrl(
    title.cover_image_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
    IMAGE_PRESETS.hero
  );

  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full overflow-hidden">
      <img 
        src={optimizedImageUrl}
        alt={title.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
        width={1920}
        height={1080}
      />
      
      <div className="absolute inset-0 gradient-hero" />
      
      <div className="absolute inset-0 flex items-end sm:items-center pb-8 sm:pb-0">
        <div className="container mx-auto px-4 max-w-full sm:max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 text-shadow animate-fade-in">
            {title.title}
          </h1>
          
          <div className="flex items-center gap-2 sm:gap-4 mb-3 md:mb-4 text-xs sm:text-sm animate-fade-in">
            {title.category && title.category.length > 0 && (
              <span>{title.category.join(' • ')}</span>
            )}
            {title.is_tv && (
              <span className="px-2 py-1 border border-muted-foreground rounded">
                En Vivo
              </span>
            )}
          </div>
          
          {title.description && (
            <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 text-foreground/90 line-clamp-2 sm:line-clamp-3 animate-fade-in">
              {title.description}
            </p>
          )}
          
          <div className="flex gap-3 sm:gap-4 animate-fade-in">
            <Button 
              size="default"
              className="shadow-glow text-sm sm:text-base"
              onClick={() => navigate(`/watch/${title.id}`)}
            >
              <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Reproducir
            </Button>
            <Button 
              size="default"
              variant="secondary"
              className="text-sm sm:text-base"
              onClick={() => navigate(`/title/${title.id}`)}
            >
              <Info className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Más Info</span>
              <span className="sm:hidden">Info</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
