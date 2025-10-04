import { Play, Info } from 'lucide-react';
import { Title } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  title: Title;
}

const MovieCard = ({ title }: MovieCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="group relative flex-shrink-0 w-48 cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={() => navigate(`/title/${title.id}`)}
    >
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={title.thumbnail} 
          alt={title.title}
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-sm font-semibold mb-2 text-shadow">{title.title}</h3>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/watch/${title.id}`);
              }}
            >
              <Play className="h-3 w-3" />
              Ver
            </button>
            <button className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded text-xs hover:bg-secondary/90">
              <Info className="h-3 w-3" />
              Info
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-xs text-muted-foreground">
          {title.year} • {title.rating}/10
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
