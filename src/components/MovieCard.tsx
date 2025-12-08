import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { Content } from '@/types/content';
import { useNavigate } from 'react-router-dom';
import { optimizeImageUrl } from '@/utils/imageOptimizer';

interface MovieCardProps {
  title: Content;
  priority?: boolean;
}

export function MovieCard({ title, priority = false }: MovieCardProps) {
  const navigate = useNavigate();

  const optimizedImageUrl = optimizeImageUrl(
    title.cover_image_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop',
    { width: 500, quality: 80 }
  );

  return (
    <div 
      className="relative w-[140px] sm:w-[160px] md:w-[180px] aspect-[2/3] flex-shrink-0 cursor-pointer group"
    >
      {/* Base Card */}
      <div className="relative w-full h-full rounded-md overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-black/70">
        {/* Poster Image */}
        <img 
          src={optimizedImageUrl} 
          alt={title.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading={priority ? "eager" : "lazy"}
          width={500}
          height={750}
          decoding="async"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content on Hover */}
        <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Title */}
          <div className="px-2 pb-12">
            <h3 className="text-white font-bold text-xs leading-tight line-clamp-2 drop-shadow-lg">
              {title.title}
            </h3>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/95 p-2 rounded-b-md">
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/watch/${title.id}`);
                }}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Reproducir"
              >
                <Play className="w-4 h-4 text-black fill-current ml-0.5" />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center hover:border-white transition-colors"
                  aria-label="Añadir"
                >
                  <Plus className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center hover:border-white transition-colors"
                  aria-label="Me gusta"
                >
                  <ThumbsUp className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/title/${title.id}`);
                  }}
                  className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center hover:border-white transition-colors"
                  aria-label="Más info"
                >
                  <ChevronDown className="w-3 h-3 text-white" />
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