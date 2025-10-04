import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProfiles } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const Profiles = () => {
  const navigate = useNavigate();
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [newProfileData, setNewProfileData] = useState({ name: '', avatar: '👤', pin: '' });
  const [pinInput, setPinInput] = useState('');

  const avatarOptions = ['👨', '👩', '👦', '👧', '🧑', '👴', '👵', '🦸', '🦹', '🧙'];

  const handleProfileClick = (profileId: string) => {
    setSelectedProfile(profileId);
    setShowPinDialog(true);
  };

  const handlePinSubmit = () => {
    if (pinInput.length === 4) {
      toast({
        title: "Acceso concedido",
        description: "Bienvenido a OTT Perú",
      });
      navigate('/home');
    }
  };

  const handleAddProfile = () => {
    toast({
      title: "Perfil creado",
      description: `Se ha creado el perfil de ${newProfileData.name}`,
    });
    setShowAddProfile(false);
    setNewProfileData({ name: '', avatar: '👤', pin: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center animate-fade-in max-w-4xl">
        <h1 className="text-4xl font-bold mb-12">¿Quién está viendo?</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {mockProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              className="flex flex-col items-center gap-4 cursor-pointer group"
            >
              <div className="w-32 h-32 bg-secondary rounded-lg flex items-center justify-center text-6xl transition-all group-hover:shadow-glow group-hover:scale-110 relative">
                {profile.avatar}
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full" />
              </div>
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                {profile.name}
              </span>
            </div>
          ))}

          <div
            onClick={() => setShowAddProfile(true)}
            className="flex flex-col items-center gap-4 cursor-pointer group"
          >
            <div className="w-32 h-32 bg-secondary/50 border-2 border-dashed border-border rounded-lg flex items-center justify-center transition-all group-hover:border-primary group-hover:scale-110">
              <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
              Agregar Perfil
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={() => navigate('/account')}
          className="px-8"
        >
          Administrar Perfiles
        </Button>
      </div>

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ingresa tu PIN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="text-center text-2xl tracking-widest"
            />
            <Button
              onClick={handlePinSubmit}
              className="w-full"
              disabled={pinInput.length !== 4}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddProfile} onOpenChange={setShowAddProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={newProfileData.name}
                onChange={(e) => setNewProfileData({ ...newProfileData, name: e.target.value })}
                placeholder="Nombre del perfil"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Selecciona un avatar</Label>
              <div className="grid grid-cols-5 gap-3 mt-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setNewProfileData({ ...newProfileData, avatar })}
                    className={`w-full aspect-square rounded-lg text-3xl flex items-center justify-center transition-all ${
                      newProfileData.avatar === avatar
                        ? 'bg-primary scale-110'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>PIN de 4 dígitos (opcional)</Label>
              <Input
                type="password"
                maxLength={4}
                value={newProfileData.pin}
                onChange={(e) => setNewProfileData({ ...newProfileData, pin: e.target.value })}
                placeholder="••••"
                className="mt-2"
              />
            </div>

            <Button onClick={handleAddProfile} className="w-full shadow-glow">
              Crear Perfil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profiles;
