import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Content } from '@/types/content';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';
import { useRef, useMemo, useCallback } from 'react';

interface CarouselProps {
  title: string;
  titles: Content[];
}

export function Carousel({ title, titles }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 30 items for infinite scroll feel
  const extendedContent = useMemo(() => {
    if (!titles || titles.length === 0) return [];
    const extended: Content[] = [];
    const targetCount = 30;
    
    for (let i = 0; i < targetCount; i++) {
      const originalItem = titles[i % titles.length];
      extended.push({
        ...originalItem,
        id: `${originalItem.id}-carousel-${i}`
      });
    }
    return extended;
  }, [titles]);

  // Circular scroll logic
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (direction === 'right') {
      if (container.scrollLeft >= maxScroll - 50) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 50) {
        container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  if (!titles || titles.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Section Title - positioned above the scroll area */}
      <h2 className="text-2xl font-bold text-gray-100 ml-12 drop-shadow-lg tracking-tight relative z-10 mb-2">
        {title}
      </h2>
      
      {/* Carousel Container - clip only horizontal, allow vertical overflow */}
      <div className="relative group/carousel" style={{ clipPath: 'inset(-100px 0)' }}>
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-40 w-12 rounded-none bg-black/60 hover:bg-black/90 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-10 w-10 text-white" />
        </Button>
        
        {/* Scrollable Content - padding for hover space, hidden scrollbar */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto overflow-y-visible py-4 px-12 scrollbar-hide select-none scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
          }}
        >
          {extendedContent.map((item, index) => (
            <MovieCard 
              key={item.id} 
              title={{ ...item, id: titles[index % titles.length].id }} 
              priority={index < 6}
            />
          ))}
        </div>
        
        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-40 w-12 rounded-none bg-black/60 hover:bg-black/90 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-10 w-10 text-white" />
        </Button>
      </div>
    </div>
  );
}

export default Carousel;