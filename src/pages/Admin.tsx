import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockStats, mockCommunityRequests, mockUsers, mockTitles } from '@/data/mockData';
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

        <div className="grid gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Usuarios Registrados</CardTitle>
              <CardDescription>Gestión de usuarios de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.plan}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Activo' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Catálogo de Contenido</CardTitle>
              <CardDescription>Títulos disponibles en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Géneros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTitles.map((title) => (
                    <TableRow key={title.id}>
                      <TableCell className="font-medium">{title.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {title.type === 'movie' ? 'Película' : 'Serie'}
                        </Badge>
                      </TableCell>
                      <TableCell>{title.year}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{title.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {title.genres.join(', ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Solicitudes de Comunidad</CardTitle>
              <CardDescription>Gestión de solicitudes de contenido</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Solicitado por</TableHead>
                    <TableHead>Votos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCommunityRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{request.votes} votos</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {request.status === 'approved' ? 'Aprobado' :
                           request.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{request.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
