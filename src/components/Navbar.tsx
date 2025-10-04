import { Search, Bell, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/home" className="text-2xl font-bold text-primary">
            OTT Perú
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/home" 
              className={`text-sm transition-colors ${isActive('/home') ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`}
            >
              Inicio
            </Link>
            <Link 
              to="/catalog" 
              className={`text-sm transition-colors ${isActive('/catalog') ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`}
            >
              Catálogo
            </Link>
            <Link 
              to="/live-tv" 
              className={`text-sm transition-colors ${isActive('/live-tv') ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`}
            >
              TV en Vivo
            </Link>
            <Link 
              to="/community" 
              className={`text-sm transition-colors ${isActive('/community') ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'}`}
            >
              Comunidad
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/catalog')}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/account')}
          >
            <User className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
