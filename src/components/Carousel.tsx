import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Title } from '@/data/mockData';
import MovieCard from './MovieCard';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface CarouselProps {
  title: string;
  titles: Title[];
}

const Carousel = ({ title, titles }: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 800;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-6 md:mb-8 animate-fade-in">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 px-4">{title}</h2>
      <div className="relative group">
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        
        <div 
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 scroll-smooth snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {titles.map((title) => (
            <div key={title.id} className="snap-start">
              <MovieCard title={title} />
            </div>
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default Carousel;
