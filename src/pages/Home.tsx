import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import Carousel from '@/components/Carousel';
import { mockTitles } from '@/data/mockData';

const Home = () => {
  const featuredTitle = mockTitles[0];
  const trending = mockTitles.slice(0, 6);
  const continueWatching = mockTitles.slice(1, 5);
  const newReleases = mockTitles.slice(2, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <HeroBanner title={featuredTitle} />
        
        <div className="py-8">
          <Carousel title="Tendencias" titles={trending} />
          <Carousel title="Continuar Viendo" titles={continueWatching} />
          <Carousel title="Nuevos Lanzamientos" titles={newReleases} />
          <Carousel title="Popular en Perú" titles={mockTitles} />
        </div>
      </div>
    </div>
  );
};

export default Home;
