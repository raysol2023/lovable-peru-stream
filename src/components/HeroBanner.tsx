import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Generate 30 items for the trending strip
const TRENDING_ITEMS = Array.from({ length: 30 }, (_, i) => ({
  ...FEATURED_CONTENT[i % FEATURED_CONTENT.length],
  id: `trending-${i}`,
}));

interface HeroBannerProps {
  title?: Content;
}

export function HeroBanner({ title }: HeroBannerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const items = FEATURED_CONTENT;
  const currentItem = items[currentIndex];

  // Auto-play logic - 6 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 500);
    }, 6000);

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

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="relative h-[95vh] w-full overflow-hidden bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* === LAYER 1: Background Image === */}
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

      {/* Gradient Overlays */}
      {/* Left fade for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.4) 100%)' }} />

      {/* === CRITICAL: Dark "bed" at bottom for thumbnail strip === */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-background via-background to-transparent z-10" />

      {/* === LAYER 2: Title & Buttons (floating above thumbnail strip) === */}
      <div className="absolute left-6 sm:left-8 lg:left-12 bottom-52 z-20 max-w-2xl">
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

      {/* === LAYER 3: Bottom Thumbnail Strip (Static - doesn't rotate) === */}
      <div className="group/strip absolute bottom-0 left-0 w-full z-30 px-6 sm:px-8 lg:px-12 pb-6">
        {/* Section Title - Always visible */}
        <div className="relative mb-3">
          <p className="text-[11px] font-bold text-gray-200 uppercase tracking-widest drop-shadow-md">
            Tendencias Ahora
          </p>
        </div>

        {/* Scroll Container with Navigation */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollThumbnails('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-40 opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 bg-black/50 hover:bg-black/80 rounded-full p-2"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Thumbnails - Using TRENDING_ITEMS (30 items) */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TRENDING_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleThumbnailClick(idx % items.length)}
                className={cn(
                  "group relative flex-shrink-0 w-64 aspect-video rounded-lg overflow-hidden transition-all duration-300",
                  "border hover:border-white hover:scale-105 cursor-pointer",
                  (idx % items.length) === currentIndex 
                    ? "border-white opacity-100 scale-105 ring-2 ring-white/50" 
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={item.cover_image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-white font-medium truncate">
                    {item.title}
                  </p>
                </div>

                {/* Play icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                </div>

                {/* Active indicator */}
                {(idx % items.length) === currentIndex && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scrollThumbnails('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-40 opacity-0 group-hover/strip:opacity-100 transition-opacity duration-300 bg-black/50 hover:bg-black/80 rounded-full p-2"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
