import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import Carousel from '@/components/Carousel';
import SkeletonCard from '@/components/SkeletonCard';
import { useContent } from '@/hooks/useContent';
import { ContentCarousel } from '@/types/content';

export default function Home() {
  const { data: content, isLoading } = useContent();

  // Organize content into carousels
  const carousels: ContentCarousel[] = content ? [
    { 
      title: "Recomendados para Ti", 
      category: "recommended", 
      content: content.filter(c => c.category?.includes('Recomendados')).slice(0, 10) 
    },
    { 
      title: "Tendencias Hoy", 
      category: "trending", 
      content: content.filter(c => c.category?.includes('Tendencias')).slice(0, 10) 
    },
    { 
      title: "Acción", 
      category: "action", 
      content: content.filter(c => c.category?.includes('Acción')).slice(0, 10) 
    },
    { 
      title: "Drama", 
      category: "drama", 
      content: content.filter(c => c.category?.includes('Drama')).slice(0, 10) 
    },
    {
      title: "Todo el Contenido",
      category: "all",
      content: content.slice(0, 15)
    }
  ] : [];

  const featuredTitle = content?.[0];

  if (isLoading || !content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16">
          <div className="w-full h-[70vh] bg-gradient-to-b from-secondary to-background animate-pulse" />
          
          <div className="py-8 container mx-auto px-4">
            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="mb-8">
                <div className="h-8 w-48 bg-secondary rounded mb-4 animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero Banner */}
        <HeroBanner title={featuredTitle} />
        
        {/* Content Sections - Clear separation from Hero */}
        <div className="mt-8 pb-16">
          {carousels.map((carousel) => 
            carousel.content.length > 0 && (
              <Carousel 
                key={carousel.category} 
                title={carousel.title} 
                titles={carousel.content} 
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}