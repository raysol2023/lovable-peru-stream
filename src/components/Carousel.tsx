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

  // Generate extended content (30 items) by repeating for infinite feel
  const extendedContent = useMemo(() => {
    if (!titles || titles.length === 0) return [];
    const repeated: Content[] = [];
    const targetCount = 30;
    for (let i = 0; i < targetCount; i++) {
      const originalItem = titles[i % titles.length];
      repeated.push({
        ...originalItem,
        id: `${originalItem.id}-${i}` // Unique key for React
      });
    }
    return repeated;
  }, [titles]);

  // Circular scroll logic
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (direction === 'right') {
      // If at or near end, loop back to start
      if (container.scrollLeft >= maxScroll - 50) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      // If at start, loop to end
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
    <div className="mb-4 md:mb-6">
      {/* Section Title - Netflix style hierarchy */}
      <h2 className="text-2xl font-semibold text-white mb-2 pl-12 drop-shadow-md tracking-tight">
        {title}
      </h2>
      
      {/* Carousel Container */}
      <div className="relative group/carousel">
        {/* Left Arrow - z-30 so cards on hover (z-50) appear above */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 h-full w-12 rounded-none bg-black/40 hover:bg-black/70 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-10 w-10 text-white" />
        </Button>
        
        {/* Scrollable Content */}
        <div 
          ref={scrollRef}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-12 py-6 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {extendedContent.map((item, index) => (
            <MovieCard 
              key={item.id} 
              title={{ ...item, id: titles[index % titles.length].id }} 
              priority={index < 6}
            />
          ))}
        </div>
        
        {/* Right Arrow - z-30 so cards on hover (z-50) appear above */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 h-full w-12 rounded-none bg-black/40 hover:bg-black/70 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-10 w-10 text-white" />
        </Button>
      </div>
    </div>
  );
}

export default Carousel;
