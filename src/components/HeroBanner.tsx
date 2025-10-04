import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Title } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface HeroBannerProps {
  title: Title;
}

const HeroBanner = ({ title }: HeroBannerProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full overflow-hidden">
      <img 
        src={title.banner || title.thumbnail}
        alt={title.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 gradient-hero" />
      
      <div className="absolute inset-0 flex items-end sm:items-center pb-8 sm:pb-0">
        <div className="container mx-auto px-4 max-w-full sm:max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 text-shadow animate-fade-in">
            {title.title}
          </h1>
          
          <div className="flex items-center gap-2 sm:gap-4 mb-3 md:mb-4 text-xs sm:text-sm animate-fade-in">
            <span className="text-primary font-semibold">⭐ {title.rating}</span>
            <span>{title.year}</span>
            <span className="hidden sm:inline">{title.type === 'movie' ? title.duration : `${title.seasons} Temporadas`}</span>
          </div>
          
          <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 text-foreground/90 line-clamp-2 sm:line-clamp-3 animate-fade-in">
            {title.synopsis}
          </p>
          
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
};

export default HeroBanner;
