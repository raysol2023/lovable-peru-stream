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
      className="relative w-[160px] sm:w-[180px] md:w-[200px] aspect-[2/3] flex-shrink-0 transition-all duration-300 ease-in-out cursor-pointer group hover:scale-125 hover:z-[999] origin-center"
      style={{ willChange: 'transform' }}
    >
      {/* Base Card - Clean poster */}
      <div className="relative w-full h-full rounded-md overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-black/80 transition-shadow duration-300">
        {/* Poster Image */}
        <img 
          src={optimizedImageUrl} 
          alt={title.title}
          className="w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
          width={500}
          height={750}
          decoding="async"
        />

        {/* Hover Overlay - Only visible on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content on Hover */}
        <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Title & Category */}
          <div className="px-3 pb-14">
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">
              {title.title}
            </h3>
            {title.category?.[0] && (
              <p className="text-xs text-gray-300 mt-1">{title.category[0]}</p>
            )}
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 p-3 rounded-b-md">
            <div className="flex items-center justify-between gap-1">
              {/* Play Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/watch/${title.id}`);
                }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors shadow-md"
                aria-label="Reproducir"
              >
                <Play className="w-5 h-5 text-black fill-current ml-0.5" />
              </button>

              {/* Secondary Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
                  aria-label="Añadir a mi lista"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
                  aria-label="Me gusta"
                >
                  <ThumbsUp className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/title/${title.id}`);
                  }}
                  className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all"
                  aria-label="Más información"
                >
                  <ChevronDown className="w-4 h-4 text-white" />
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