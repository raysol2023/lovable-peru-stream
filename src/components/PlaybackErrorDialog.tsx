import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlaybackError } from "@/types/playback";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface PlaybackErrorDialogProps {
  error: PlaybackError | null;
  onClose: () => void;
  onRetry?: () => void;
}

export function PlaybackErrorDialog({ error, onClose, onRetry }: PlaybackErrorDialogProps) {
  const navigate = useNavigate();

  if (!error) return null;

  const getErrorContent = () => {
    switch (error.code) {
      case 'GEO_BLOCKED':
        return {
          title: "Contenido no disponible",
          description: error.error,
          icon: "🌎",
          actions: (
            <AlertDialogAction onClick={onClose}>Entendido</AlertDialogAction>
          )
        };

      case 'CONCURRENT_LIMIT_REACHED':
        return {
          title: "Límite de dispositivos alcanzado",
          description: `Has alcanzado el límite de ${error.limit} dispositivo(s) simultáneos. Por favor, cierra la reproducción en otro dispositivo.`,
          icon: "📱",
          details: error.oldest_device ? `Dispositivo más antiguo: ${error.oldest_device}` : undefined,
          actions: (
            <>
              {onRetry && (
                <Button variant="outline" onClick={() => { onClose(); onRetry(); }}>
                  Reintentar
                </Button>
              )}
              <AlertDialogAction onClick={() => { onClose(); navigate('/account'); }}>
                Ver Planes
              </AlertDialogAction>
            </>
          )
        };

      case 'PLAN_UPGRADE_REQUIRED':
        return {
          title: "Mejora tu Plan",
          description: error.error,
          icon: "📺",
          details: error.current_plan ? `Plan actual: ${error.current_plan}` : undefined,
          actions: (
            <>
              <Button variant="outline" onClick={onClose}>
                Volver
              </Button>
              <AlertDialogAction onClick={() => { onClose(); navigate('/account'); }}>
                Ver Planes
              </AlertDialogAction>
            </>
          )
        };

      case 'NO_SUBSCRIPTION':
        return {
          title: "Suscripción requerida",
          description: error.error,
          icon: "💳",
          actions: (
            <>
              <Button variant="outline" onClick={() => { onClose(); navigate('/home'); }}>
                Volver
              </Button>
              <AlertDialogAction onClick={() => { onClose(); navigate('/account'); }}>
                Ver Planes
              </AlertDialogAction>
            </>
          )
        };

      default:
        return {
          title: "Error de reproducción",
          description: error.error || "Ha ocurrido un error inesperado",
          icon: "⚠️",
          actions: <AlertDialogAction onClick={onClose}>Cerrar</AlertDialogAction>
        };
    }
  };

  const content = getErrorContent();

  return (
    <AlertDialog open={!!error} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{content.icon}</span>
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{content.description}</p>
            {content.details && (
              <p className="text-sm text-muted-foreground">{content.details}</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {content.actions}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
