import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useActiveProfile } from "@/hooks/useActiveProfile";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  pin: string | null;
}

const Profiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [pin, setPin] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileAvatar, setNewProfileAvatar] = useState("👤");
  const [newProfilePin, setNewProfilePin] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setActiveProfile } = useActiveProfile();

  const avatarOptions = ["👤", "👨", "👩", "🧑", "👶", "🧒", "👦", "👧"];

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los perfiles",
        variant: "destructive",
      });
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
    if (profile.pin) {
      setShowPinDialog(true);
    } else {
      selectProfile(profile.id);
    }
  };

  const handlePinSubmit = () => {
    if (!selectedProfile) return;

    if (selectedProfile.pin === pin) {
      selectProfile(selectedProfile.id);
    } else {
      toast({
        title: "PIN Incorrecto",
        description: "El PIN ingresado no es válido",
        variant: "destructive",
      });
    }
  };

  const selectProfile = (profileId: string) => {
    setActiveProfile(profileId);
    toast({
      title: "Perfil seleccionado",
      description: "¡Bienvenido!",
    });
    navigate("/home");
  };

  const handleAddProfile = async () => {
    if (!user || !newProfileName) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para el perfil",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        name: newProfileName,
        avatar_url: newProfileAvatar,
        pin: newProfilePin || null
      });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el perfil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Perfil creado!",
        description: `El perfil ${newProfileName} ha sido creado exitosamente`,
      });
      setShowAddProfile(false);
      setNewProfileName("");
      setNewProfileAvatar("👤");
      setNewProfilePin("");
      fetchProfiles();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-12">
          ¿Quién está viendo?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="cursor-pointer hover:scale-105 transition-transform hover:border-primary"
              onClick={() => handleProfileClick(profile)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">{profile.avatar_url || "👤"}</div>
                <p className="font-medium">{profile.name}</p>
                {profile.pin && (
                  <p className="text-xs text-muted-foreground mt-1">🔒 Protegido</p>
                )}
              </CardContent>
            </Card>
          ))}

          <Card
            className="cursor-pointer hover:scale-105 transition-transform border-dashed hover:border-primary"
            onClick={() => setShowAddProfile(true)}
          >
            <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
              <PlusCircle className="h-12 w-12 mb-2 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">Agregar Perfil</p>
            </CardContent>
          </Card>
        </div>

        {/* PIN Dialog */}
        <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ingresa el PIN</DialogTitle>
              <DialogDescription>
                Este perfil está protegido con PIN
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPinDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handlePinSubmit}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Profile Dialog */}
        <Dialog open={showAddProfile} onOpenChange={setShowAddProfile}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Perfil</DialogTitle>
              <DialogDescription>
                Personaliza tu nuevo perfil
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="profileName">Nombre</Label>
                <Input
                  id="profileName"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Nombre del perfil"
                />
              </div>

              <div>
                <Label>Avatar</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {avatarOptions.map((avatar) => (
                    <Button
                      key={avatar}
                      type="button"
                      variant={newProfileAvatar === avatar ? "default" : "outline"}
                      className="text-2xl h-12"
                      onClick={() => setNewProfileAvatar(avatar)}
                    >
                      {avatar}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="profilePin">PIN (opcional)</Label>
                <Input
                  id="profilePin"
                  type="password"
                  maxLength={4}
                  value={newProfilePin}
                  onChange={(e) => setNewProfilePin(e.target.value)}
                  placeholder="••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProfile(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProfile}>Crear Perfil</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profiles;
