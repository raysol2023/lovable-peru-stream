import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast({
      title: "Correo enviado",
      description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate('/login')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesión
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              {!isSubmitted 
                ? 'Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña'
                : 'Te hemos enviado un correo con las instrucciones'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
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

                <Button type="submit" className="w-full shadow-glow">
                  Enviar instrucciones
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
