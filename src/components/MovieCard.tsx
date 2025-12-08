import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { Content } from '@/types/content';
import { useNavigate } from 'react-router-dom';
import { optimizeImageUrl } from '@/utils/imageOptimizer';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  title: Content;
  priority?: boolean;
}

export function MovieCard({ title, priority = false }: MovieCardProps) {
  const navigate = useNavigate();

  const optimizedImageUrl = optimizeImageUrl(
    title.cover_image_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
    { width: 500, quality: 80 }
  );

  return (
    <div 
      className={cn(
        "group/card relative flex-shrink-0 w-36 sm:w-40 md:w-44 cursor-pointer",
        "transition-all duration-300 ease-out delay-100",
        "hover:scale-110 hover:z-[100]"
      )}
    >
      {/* Card Container - padding added to allow overflow on hover */}
      <div className="relative overflow-visible rounded-md shadow-lg group-hover/card:shadow-2xl group-hover/card:shadow-black/60 transition-shadow duration-300">
        {/* Clean Poster Image */}
        <div className="aspect-[2/3] overflow-hidden rounded-md">
          <img 
            src={optimizedImageUrl} 
            alt={title.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            loading={priority ? "eager" : "lazy"}
            width={500}
            height={750}
            decoding="async"
          />
        </div>

        {/* Hover Overlay - Gradient from bottom */}
        <div className="absolute inset-0 rounded-md bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Title - Only visible on hover */}
        <div className="absolute bottom-14 left-0 right-0 px-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">
            {title.title}
          </h3>
          {title.category?.[0] && (
            <p className="text-xs text-gray-300 mt-1">{title.category[0]}</p>
          )}
        </div>

        {/* Netflix-style Control Bar - Absolute positioned at bottom */}
        <div className="absolute -bottom-1 left-0 right-0 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300">
          <div className="bg-zinc-900/95 backdrop-blur-sm rounded-b-md p-2 shadow-xl mx-0">
            <div className="flex items-center justify-between gap-1">
              {/* Play Button - Primary */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/watch/${title.id}`);
                }}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors shadow-md"
                aria-label="Reproducir"
              >
                <Play className="w-4 h-4 text-black fill-current ml-0.5" />
              </button>

              {/* Secondary Actions */}
              <div className="flex items-center gap-1">
                {/* Add to List */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
                  aria-label="Añadir a mi lista"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>

                {/* Like */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
                  aria-label="Me gusta"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-white" />
                </button>

                {/* More Info */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/title/${title.id}`);
                  }}
                  className="w-7 h-7 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
                  aria-label="Más información"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;