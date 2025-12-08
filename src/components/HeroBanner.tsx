import { useState, useEffect, useCallback } from 'react';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Content } from '@/types/content';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Featured content for the immersive carousel
const FEATURED_CONTENT = [
  {
    id: 'featured-1',
    title: 'Dune: Part Two',
    description: 'Paul Atreides se une a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia. Enfrentando una elección entre el amor de su vida y el destino del universo.',
    cover_image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80',
    category: ['Ciencia Ficción', 'Aventura'],
    year: '2024',
  },
  {
    id: 'featured-2',
    title: 'Godzilla x Kong: The New Empire',
    description: 'Dos titanes legendarios se unen contra una amenaza colosal oculta en nuestro mundo que pone en peligro su existencia y la nuestra.',
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80',
    category: ['Acción', 'Ciencia Ficción'],
    year: '2024',
  },
  {
    id: 'featured-3',
    title: 'Civil War',
    description: 'En un futuro cercano donde América está al borde del colapso, un equipo de periodistas de guerra viaja a través del país durante una guerra civil que se intensifica rápidamente.',
    cover_image_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&q=80',
    category: ['Drama', 'Thriller'],
    year: '2024',
  },
  {
    id: 'featured-4',
    title: 'Kung Fu Panda 4',
    description: 'Po debe entrenar a un nuevo Guerrero Dragón mientras se enfrenta a una hechicera malvada llamada La Camaleona que puede transformarse en cualquier criatura.',
    cover_image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80',
    category: ['Animación', 'Comedia'],
    year: '2024',
  },
  {
    id: 'featured-5',
    title: 'Oppenheimer',
    description: 'La historia del científico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica durante la Segunda Guerra Mundial.',
    cover_image_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&q=80',
    category: ['Drama', 'Historia'],
    year: '2023',
  },
  {
    id: 'featured-6',
    title: 'Furiosa: A Mad Max Saga',
    description: 'La historia del origen de la guerrera Furiosa antes de su encuentro con Max Rockatansky en el apocalíptico páramo.',
    cover_image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80',
    category: ['Acción', 'Aventura'],
    year: '2024',
  },
];

interface HeroBannerProps {
  title?: Content;
}

export function HeroBanner({ title }: HeroBannerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use featured content or fallback to prop
  const items = FEATURED_CONTENT;
  const currentItem = items[currentIndex];

  // Get next 3 items for thumbnails
  const getUpcomingItems = useCallback(() => {
    const upcoming = [];
    for (let i = 1; i <= 3; i++) {
      const index = (currentIndex + i) % items.length;
      upcoming.push({ ...items[index], originalIndex: index });
    }
    return upcoming;
  }, [currentIndex, items]);

  const upcomingItems = getUpcomingItems();

  // Auto-play logic
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const handleThumbnailClick = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  const handlePlay = () => {
    if (title) {
      navigate(`/watch/${title.id}`);
    }
  };

  const handleMoreInfo = () => {
    if (title) {
      navigate(`/title/${title.id}`);
    }
  };

  return (
    <div 
      className="relative h-[70vh] sm:h-[75vh] md:h-[85vh] w-full overflow-hidden bg-zinc-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Transition */}
      <div className="absolute inset-0">
        <img 
          src={currentItem.cover_image_url}
          alt={currentItem.title}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Immersive Gradient Overlays */}
      {/* Bottom to top fade - blends with content below */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      
      {/* Left to right fade - text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" 
           style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(9,9,11,0.3) 100%)' }} />

      {/* Content Container */}
      <div className="absolute inset-0 flex items-end pb-16 sm:pb-20 md:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Category Pills */}
            <div className={cn(
              "flex items-center gap-2 mb-4 transition-all duration-700 delay-100",
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}>
              {currentItem.category?.map((cat, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 text-xs font-medium bg-white/10 backdrop-blur-sm rounded-full text-white/90 border border-white/10"
                >
                  {cat}
                </span>
              ))}
              {currentItem.year && (
                <span className="px-3 py-1 text-xs font-medium bg-primary/20 backdrop-blur-sm rounded-full text-primary border border-primary/30">
                  {currentItem.year}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className={cn(
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight transition-all duration-700 delay-150",
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
            >
              {currentItem.title}
            </h1>

            {/* Description */}
            <p className={cn(
              "text-base sm:text-lg text-white/80 mb-6 line-clamp-2 sm:line-clamp-3 max-w-xl transition-all duration-700 delay-200",
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}>
              {currentItem.description}
            </p>

            {/* Action Buttons */}
            <div className={cn(
              "flex gap-3 sm:gap-4 transition-all duration-700 delay-300",
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}>
              <Button 
                size="lg"
                className="bg-white text-zinc-900 hover:bg-white/90 shadow-2xl shadow-white/20 text-sm sm:text-base font-semibold px-6 sm:px-8"
                onClick={handlePlay}
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Reproducir
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 text-sm sm:text-base font-semibold px-6 sm:px-8"
                onClick={handleMoreInfo}
              >
                <Info className="mr-2 h-5 w-5" />
                Más Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Thumbnails - TV360 Style */}
      <div className="absolute right-4 sm:right-8 lg:right-12 bottom-20 sm:bottom-24 md:bottom-32 hidden sm:flex flex-col gap-3">
        <span className="text-xs text-white/50 uppercase tracking-wider mb-1 font-medium">
          A continuación
        </span>
        {upcomingItems.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => handleThumbnailClick(item.originalIndex)}
            className={cn(
              "group relative w-28 md:w-36 lg:w-44 aspect-video rounded-lg overflow-hidden transition-all duration-300",
              "ring-2 ring-transparent hover:ring-white/50 focus:ring-white/50",
              "transform hover:scale-105 hover:shadow-2xl hover:shadow-black/50",
              idx === 0 && "ring-primary/50"
            )}
          >
            <img
              src={item.cover_image_url}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {/* Thumbnail overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Thumbnail title */}
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-[10px] md:text-xs text-white font-medium truncate">
                {item.title}
              </p>
            </div>

            {/* Play indicator on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-current" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleThumbnailClick(idx)}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              idx === currentIndex 
                ? "w-8 bg-white" 
                : "w-2 bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;
