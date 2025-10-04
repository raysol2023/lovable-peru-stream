import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">Configuración</h1>

        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Preferencias de Reproducción</CardTitle>
              <CardDescription>Ajusta tu experiencia de visualización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reproducción Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproducir siguiente episodio automáticamente
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Vista Previa al Pasar</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar vista previa al pasar sobre un título
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div>
                <Label>Calidad de Video</Label>
                <Select defaultValue="auto">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automática</SelectItem>
                    <SelectItem value="4k">4K Ultra HD</SelectItem>
                    <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                    <SelectItem value="720p">HD (720p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Idioma y Región</CardTitle>
              <CardDescription>Personaliza tu idioma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Idioma de la Interfaz</Label>
                <Select defaultValue="es">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Idioma de Audio Predeterminado</Label>
                <Select defaultValue="es">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español (Latino)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="original">Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subtítulos</Label>
                <Select defaultValue="es">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Desactivados</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Gestiona tus preferencias de notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Nuevos Lanzamientos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar cuando hay nuevo contenido
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Actualizaciones de Solicitudes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre el estado de tus solicitudes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Recomendaciones Personalizadas</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir sugerencias basadas en tus gustos
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
