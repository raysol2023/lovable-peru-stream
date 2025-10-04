import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockInvoices } from '@/data/mockData';
import { CheckCircle, CreditCard } from 'lucide-react';

const Account = () => {
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
                <Button variant="secondary">Cambiar Plan</Button>
                <Button variant="outline">Cancelar Suscripción</Button>
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
      </div>
    </div>
  );
};

export default Account;
