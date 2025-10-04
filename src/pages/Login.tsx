import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - always succeeds
    navigate('/profiles');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-card/50 backdrop-blur-lg rounded-lg shadow-glow animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">OTT Perú</h1>
          <p className="text-muted-foreground">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2"
              required
            />
          </div>

          <Button type="submit" className="w-full shadow-glow">
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:underline font-semibold"
            >
              Regístrate ahora
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
