import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquarePlus } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useNavigate } from 'react-router-dom';

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { data: content, isLoading } = useContent();
  
  const filteredTitles = useMemo(() => {
    if (!content) return [];
    if (!searchQuery) return content;
    
    return content.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [content, searchQuery]);

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return filteredTitles.slice(0, 5);
  }, [searchQuery, filteredTitles]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-6">Catálogo</h1>
          
          <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Buscar películas, series, géneros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10"
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-glow z-20 overflow-hidden">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(`/title/${item.id}`);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors flex items-center gap-3"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.is_tv ? 'TV en Vivo' : 'VOD'} • {item.category?.[0] || 'General'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button 
              variant="secondary"
              onClick={() => navigate('/community')}
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Solicitar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando catálogo...</p>
          </div>
        ) : filteredTitles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
            {filteredTitles.map((item) => (
              <MovieCard key={item.id} title={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in bg-card rounded-lg">
            <div className="mb-6">
              <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No encontramos "{searchQuery}"</h2>
            <p className="text-muted-foreground mb-6">
              ¿Te gustaría que lo agreguemos a nuestro catálogo?
            </p>
            <Button onClick={() => navigate('/community')} className="shadow-glow">
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Solicitar en la Comunidad
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
