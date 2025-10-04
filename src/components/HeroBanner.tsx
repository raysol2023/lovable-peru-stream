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
    <div className="relative h-[70vh] w-full overflow-hidden">
      <img 
        src={title.banner || title.thumbnail}
        alt={title.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 gradient-hero" />
      
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-shadow animate-fade-in">
            {title.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-4 text-sm animate-fade-in">
            <span className="text-primary font-semibold">{title.rating}/10</span>
            <span>{title.year}</span>
            <span>{title.type === 'movie' ? title.duration : `${title.seasons} Temporadas`}</span>
          </div>
          
          <p className="text-lg mb-6 text-foreground/90 animate-fade-in">
            {title.synopsis}
          </p>
          
          <div className="flex gap-4 animate-fade-in">
            <Button 
              size="lg"
              className="shadow-glow"
              onClick={() => navigate(`/watch/${title.id}`)}
            >
              <Play className="mr-2 h-5 w-5" />
              Reproducir
            </Button>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => navigate(`/title/${title.id}`)}
            >
              <Info className="mr-2 h-5 w-5" />
              Más Información
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
