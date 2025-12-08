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
        "transition-all duration-300 ease-out",
        "hover:scale-110 hover:z-50"
      )}
    >
      {/* Card Container */}
      <div className="relative overflow-hidden rounded-md shadow-lg group-hover/card:shadow-2xl group-hover/card:shadow-black/50 transition-shadow duration-300">
        {/* Clean Poster Image */}
        <div className="aspect-[2/3] overflow-hidden">
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

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

        {/* Title - Only visible on hover */}
        <div className="absolute bottom-16 left-0 right-0 px-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">
            {title.title}
          </h3>
          {title.category?.[0] && (
            <p className="text-xs text-gray-300 mt-1">{title.category[0]}</p>
          )}
        </div>
      </div>

      {/* Netflix-style Control Bar - Only visible on hover */}
      <div className="absolute -bottom-2 left-0 right-0 px-2 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300">
        <div className="bg-zinc-900/95 rounded-b-md p-2 shadow-xl">
          <div className="flex items-center justify-between gap-1">
            {/* Play Button - Primary */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/watch/${title.id}`);
              }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Reproducir"
            >
              <Play className="w-4 h-4 text-black fill-current ml-0.5" />
            </button>

            {/* Secondary Actions */}
            <div className="flex items-center gap-1">
              {/* Add to List */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors"
                aria-label="Añadir a mi lista"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>

              {/* Like */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors"
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
                className="w-7 h-7 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors"
                aria-label="Más información"
              >
                <ChevronDown className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
