import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, RefreshCcw, Tv } from "lucide-react";

interface PlaybackErrorDialogProps {
  error: { code: string; error: string } | null;
  onClose: () => void;
  onRetry: () => void;
}

export function PlaybackErrorDialog({ error, onClose, onRetry }: PlaybackErrorDialogProps) {
  const navigate = useNavigate();

  if (!error) return null;

  return (
    <Dialog open={!!error} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Error de Reproducción</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {error.error || "No se pudo reproducir el contenido. Por favor, intenta nuevamente."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              navigate(-1);
            }}
            className="w-full sm:w-auto order-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver Atrás
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              onClose();
              navigate('/livetv');
            }}
            className="w-full sm:w-auto order-2"
          >
            <Tv className="mr-2 h-4 w-4" />
            Ir a Canales
          </Button>

          <Button
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="w-full sm:w-auto order-3"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
