import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Carousel from '@/components/Carousel';
import { Button } from '@/components/ui/button';
import { Play, Plus, ThumbsUp, Share2 } from 'lucide-react';
import { useContentById } from '@/hooks/useContent';
import { useContent } from '@/hooks/useContent';

export default function TitleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: content, isLoading: contentLoading } = useContentById(id || '');
  const { data: allContent } = useContent();

  if (contentLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted-foreground">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-xl mb-4">Contenido no encontrado</p>
          <Button onClick={() => navigate('/home')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  // Find similar content based on categories
  const similarContent = allContent?.filter(c => 
    c.id !== id && 
    c.category?.some(cat => content.category?.includes(cat))
  ).slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        <div className="relative h-[60vh] w-full overflow-hidden">
          <img 
            src={content.cover_image_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728'}
            alt={content.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="max-w-4xl animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 text-shadow">{content.title}</h1>
            
            <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
              {content.category && content.category.length > 0 && (
                <div className="flex gap-2">
                  {content.category.map(cat => (
                    <span key={cat} className="bg-secondary px-3 py-1 rounded-full text-xs">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              {content.is_tv && (
                <span className="px-3 py-1 border border-muted-foreground rounded-full text-xs">
                  En Vivo
                </span>
              )}
            </div>

            {content.description && (
              <p className="text-lg mb-8 text-foreground/90">
                {content.description}
              </p>
            )}

            <div className="flex gap-4 mb-8 flex-wrap">
              <Button 
                size="lg"
                className="shadow-glow"
                onClick={() => navigate(`/watch/${content.id}`)}
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

        {similarContent.length > 0 && (
          <div className="container mx-auto px-4 py-12">
            <Carousel title="Contenido Similar" titles={similarContent} />
          </div>
        )}
      </div>
    </div>
  );
}
