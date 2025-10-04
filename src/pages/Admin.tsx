import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockStats, mockCommunityRequests } from '@/data/mockData';
import { Users, Film, TrendingUp, MessageSquare, DollarSign, Activity } from 'lucide-react';

const Admin = () => {
  const statCards = [
    {
      title: 'Usuarios Totales',
      value: mockStats.totalUsers.toLocaleString(),
      icon: Users,
      trend: '+12%',
    },
    {
      title: 'Suscripciones Activas',
      value: mockStats.activeSubscriptions.toLocaleString(),
      icon: Activity,
      trend: '+8%',
    },
    {
      title: 'Contenido Total',
      value: mockStats.totalContent,
      icon: Film,
      trend: '+5%',
    },
    {
      title: 'Solicitudes Comunidad',
      value: mockStats.communityRequests,
      icon: MessageSquare,
      trend: '+23%',
    },
    {
      title: 'Ingresos Mensuales',
      value: mockStats.monthlyRevenue,
      icon: DollarSign,
      trend: '+15%',
    },
    {
      title: 'SLA Comunidad',
      value: `${mockStats.avgSLA}%`,
      icon: TrendingUp,
      trend: '+3%',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 animate-fade-in">Panel de Administración</h1>
        <p className="text-muted-foreground mb-8">Vista general de la plataforma</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="animate-fade-in hover:shadow-glow transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <p className="text-xs text-green-500">{stat.trend} este mes</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Solicitudes Recientes</CardTitle>
              <CardDescription>Últimas solicitudes de la comunidad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCommunityRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.votes} votos
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      request.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      request.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {request.status === 'approved' ? 'Aprobado' :
                       request.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas actividades en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Nuevo usuario registrado', time: 'Hace 5 minutos' },
                  { action: 'Contenido agregado: Nueva Serie', time: 'Hace 1 hora' },
                  { action: 'Solicitud aprobada: Breaking Bad', time: 'Hace 2 horas' },
                  { action: 'Suscripción cancelada', time: 'Hace 3 horas' },
                  { action: 'Nuevo contenido solicitado', time: 'Hace 4 horas' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-secondary rounded-lg">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {activity.time}
                    </p>
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

export default Admin;
