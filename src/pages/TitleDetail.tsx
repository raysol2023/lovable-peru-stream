import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Carousel from '@/components/Carousel';
import { Button } from '@/components/ui/button';
import { Play, Plus, ThumbsUp, Share2 } from 'lucide-react';
import { mockTitles } from '@/data/mockData';

const TitleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const title = mockTitles.find(t => t.id === id);

  if (!title) {
    return <div>Título no encontrado</div>;
  }

  const similarTitles = mockTitles.filter(t => 
    t.id !== id && t.genres.some(g => title.genres.includes(g))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        <div className="relative h-[60vh] w-full overflow-hidden">
          <img 
            src={title.banner || title.thumbnail}
            alt={title.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="max-w-4xl animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 text-shadow">{title.title}</h1>
            
            <div className="flex items-center gap-4 mb-6 text-sm">
              <span className="text-primary font-semibold text-lg">{title.rating}/10</span>
              <span>{title.year}</span>
              <span>{title.type === 'movie' ? title.duration : `${title.seasons} Temporadas`}</span>
              <div className="flex gap-2">
                {title.genres.map(genre => (
                  <span key={genre} className="bg-secondary px-3 py-1 rounded-full text-xs">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg mb-8 text-foreground/90">
              {title.synopsis}
            </p>

            <div className="flex gap-4 mb-8">
              <Button 
                size="lg"
                className="shadow-glow"
                onClick={() => navigate(`/watch/${title.id}`)}
              >
                <Play className="mr-2 h-5 w-5" />
                Reproducir
              </Button>
              <Button size="lg" variant="secondary">
                <Plus className="mr-2 h-5 w-5" />
                Mi Lista
              </Button>
              <Button size="lg" variant="ghost">
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="ghost">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <Carousel title="Títulos Similares" titles={similarTitles} />
        </div>
      </div>
    </div>
  );
};

export default TitleDetail;
