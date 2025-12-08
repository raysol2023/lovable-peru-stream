import { Play, Info } from 'lucide-react';
import { Content } from '@/types/content';
import { useNavigate } from 'react-router-dom';
import { optimizeImageUrl, IMAGE_PRESETS } from '@/utils/imageOptimizer';

interface MovieCardProps {
  title: Content;
}

export function MovieCard({ title }: MovieCardProps) {
  const navigate = useNavigate();

  const optimizedImageUrl = optimizeImageUrl(
    title.cover_image_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
    IMAGE_PRESETS.card
  );

  return (
    <div 
      className="group relative flex-shrink-0 w-36 sm:w-44 md:w-48 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 focus-within:scale-105 focus-within:z-10 animate-fade-in"
      onClick={() => navigate(`/title/${title.id}`)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/title/${title.id}`);
      }}
    >
      <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-glow transition-shadow duration-300">
        <img 
          src={optimizedImageUrl} 
          alt={title.title}
          className="w-full h-56 sm:h-64 md:h-72 object-cover transition-transform duration-300"
          loading="lazy"
          width={480}
          height={270}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
          <h3 className="text-xs md:text-sm font-semibold mb-2 text-white text-shadow line-clamp-2">{title.title}</h3>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 bg-primary text-primary-foreground px-2 md:px-3 py-1 rounded text-xs hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/watch/${title.id}`);
              }}
            >
              <Play className="h-3 w-3" />
              <span className="hidden sm:inline">Ver</span>
            </button>
            <button className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 md:px-3 py-1 rounded text-xs hover:bg-secondary/80 transition-colors focus:ring-2 focus:ring-secondary">
              <Info className="h-3 w-3" />
              <span className="hidden sm:inline">Info</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-2 px-1">
        <p className="text-xs text-muted-foreground truncate">
          {title.category?.[0] || 'General'} {title.is_tv && '• En Vivo'}
        </p>
      </div>
    </div>
  );
}

export default MovieCard;
