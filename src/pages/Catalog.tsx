import { useState } from 'react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MessageSquarePlus } from 'lucide-react';
import { mockTitles } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const filteredTitles = mockTitles.filter(title =>
    title.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-6">Catálogo</h1>
          
          <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar películas y series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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

        {filteredTitles.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
            {filteredTitles.map((title) => (
              <MovieCard key={title.id} title={title} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-xl text-muted-foreground mb-4">
              No se encontraron resultados para "{searchQuery}"
            </p>
            <Button onClick={() => navigate('/community')}>
              Solicitar en la Comunidad
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
