import { useNavigate } from 'react-router-dom';
import { mockProfiles } from '@/data/mockData';

const Profiles = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold mb-12">¿Quién está viendo?</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {mockProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => navigate('/home')}
              className="flex flex-col items-center gap-4 cursor-pointer group"
            >
              <div className="w-32 h-32 bg-secondary rounded-lg flex items-center justify-center text-6xl transition-all group-hover:shadow-glow group-hover:scale-110">
                {profile.avatar}
              </div>
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                {profile.name}
              </span>
            </div>
          ))}
        </div>
        
        <button className="text-muted-foreground border border-muted-foreground px-6 py-2 rounded hover:text-foreground hover:border-foreground transition-colors">
          Administrar Perfiles
        </button>
      </div>
    </div>
  );
};

export default Profiles;
