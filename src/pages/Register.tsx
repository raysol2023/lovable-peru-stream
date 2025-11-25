import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorMessages";
import { usePlans } from "@/hooks/usePlans";
import { Check } from "lucide-react";

const Register = () => {
  const [step, setStep] = useState<'plan' | 'account'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { data: plans, isLoading: plansLoading } = usePlans();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep('account');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      toast({
        title: "Error al registrarse",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Por favor inicia sesión.",
      });
      navigate('/login');
    }
  };

  if (step === 'plan') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Elige tu Plan</h1>
            <p className="text-muted-foreground">Selecciona el plan que mejor se adapte a tus necesidades</p>
          </div>

          {plansLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans?.map((plan) => (
                <Card 
                  key={plan.id}
                  className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">
                      S/ {plan.price.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mes</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{plan.simultaneous_limit} {plan.simultaneous_limit === 1 ? 'dispositivo' : 'dispositivos'} simultáneo{plan.simultaneous_limit === 1 ? '' : 's'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{plan.scope === 'VOD' ? 'Solo VOD' : 'VOD + TV en Vivo'}</span>
                      </li>
                      {plan.description && (
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{plan.description}</span>
                        </li>
                      )}
                    </ul>
                    <Button className="w-full mt-4">
                      Seleccionar Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/login" className="text-primary hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            StreemingTv
          </h1>
          <p className="mt-2 text-muted-foreground">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-card p-8 rounded-lg shadow-lg border border-border">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="mt-1"
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
                required
                disabled={loading}
                className="mt-1"
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="mt-1"
                minLength={6}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setStep('plan')}
              disabled={loading}
              className="w-full"
            >
              Volver
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
