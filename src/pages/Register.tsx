import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockPlans } from '@/data/mockData';
import { Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'plan' | 'account'>('plan');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep('account');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "¡Cuenta creada!",
      description: "Tu suscripción ha sido activada",
    });
    navigate('/profiles');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-6xl">
        {step === 'plan' ? (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Elige tu plan</h1>
              <p className="text-muted-foreground">
                Selecciona el plan perfecto para ti. Cancela cuando quieras.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {mockPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-glow hover:scale-105 ${
                    plan.id === 'premium' ? 'border-primary shadow-glow' : ''
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <CardHeader>
                    {plan.id === 'premium' && (
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold mb-2 w-fit">
                        Más Popular
                      </div>
                    )}
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground"> / mes</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full shadow-glow">
                      Seleccionar Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/login')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Crea tu cuenta</h1>
              <p className="text-muted-foreground">
                Plan seleccionado: <span className="text-primary font-semibold">
                  {mockPlans.find(p => p.id === selectedPlan)?.name}
                </span>
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full shadow-glow">
                    Crear cuenta y suscribirme
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep('plan')}
                  >
                    Volver a planes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
