import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import Carousel from '@/components/Carousel';
import SkeletonCard from '@/components/SkeletonCard';
import { mockTitles, mockCommunityRequests } from '@/data/mockData';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const featuredTitle = mockTitles[0];
  const trending = mockTitles.slice(0, 6);
  const continueWatching = mockTitles.slice(1, 5);
  const newReleases = mockTitles.slice(2, 6);
  const recommended = mockTitles.slice(3, 9);
  const communityTitles = mockTitles.filter((_, idx) => 
    mockCommunityRequests.slice(0, 6).map((_, i) => i).includes(idx)
  );

  if (isLoading) {
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
        <HeroBanner title={featuredTitle} />
        
        <div className="py-8">
          <Carousel title="Continuar Viendo" titles={continueWatching} />
          <Carousel title="Tendencias Hoy" titles={trending} />
          <Carousel title="Recomendados para Ti" titles={recommended} />
          <Carousel title="Nuevos Lanzamientos" titles={newReleases} />
          <Carousel title="Solicitado por la Comunidad" titles={communityTitles} />
          <Carousel title="Popular en Perú" titles={mockTitles} />
        </div>
      </div>
    </div>
  );
};

export default Home;
