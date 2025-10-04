import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockInvoices, mockPlans } from '@/data/mockData';
import { CheckCircle, CreditCard, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Account = () => {
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('premium');

  const handleChangePlan = (planId: string) => {
    setCurrentPlan(planId);
    setShowChangePlan(false);
    toast({
      title: "Plan actualizado",
      description: `Tu plan ha sido cambiado a ${mockPlans.find(p => p.id === planId)?.name}`,
    });
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Suscripción cancelada",
      description: "Tu suscripción se cancelará al final del período de facturación",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">Mi Cuenta</h1>

        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Plan Actual</CardTitle>
              <CardDescription>Gestiona tu suscripción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Plan Premium</h3>
                  <p className="text-muted-foreground">S/ 29.90 / mes</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full">
                  Activo
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Acceso ilimitado a todo el contenido</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>4K Ultra HD disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Descarga para ver sin conexión</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Hasta 4 dispositivos simultáneos</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="secondary"
                  onClick={() => setShowChangePlan(true)}
                >
                  Cambiar Plan
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Cancelar Suscripción</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tu suscripción se mantendrá activa hasta el final del período de facturación actual.
                        Después de eso, perderás acceso a todo el contenido.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Mantener suscripción</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription}>
                        Sí, cancelar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
              <CardDescription>Gestiona tu forma de pago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Vence 12/25</p>
                </div>
              </div>
              <Button variant="secondary">Actualizar Método de Pago</Button>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Historial de Facturación</CardTitle>
              <CardDescription>Tus pagos recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invoice.date}</p>
                      <p className="text-sm text-muted-foreground">Plan Premium</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{invoice.amount}</p>
                      <p className="text-sm text-green-500">{invoice.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showChangePlan} onOpenChange={setShowChangePlan}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Cambiar Plan</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              {mockPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-glow ${
                    currentPlan === plan.id ? 'border-primary shadow-glow' : ''
                  }`}
                >
                  <CardHeader>
                    {currentPlan === plan.id && (
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold mb-2 w-fit">
                        Plan Actual
                      </div>
                    )}
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground"> / mes</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={currentPlan === plan.id ? 'secondary' : 'default'}
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={currentPlan === plan.id}
                    >
                      {currentPlan === plan.id ? 'Plan Actual' : 'Seleccionar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Account;
