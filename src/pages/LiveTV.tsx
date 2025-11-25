import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Play, RotateCcw, Loader2 } from 'lucide-react';
import { useLiveChannels } from '@/hooks/useLiveChannels';
import { useEPG } from '@/hooks/useEPG';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LiveTV = () => {
  const navigate = useNavigate();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: channels, isLoading: channelsLoading } = useLiveChannels();
  const { data: epgData, isLoading: epgLoading } = useEPG(selectedChannel, selectedDate);

  // Generate next 7 days for tabs
  const epgDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date: date,
        label: i === 0 ? 'Hoy' : format(date, 'EEE d', { locale: es }),
      };
    });
  }, []);

  const selectedChannelData = channels?.find(c => c.id === selectedChannel);

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handlePlayProgram = (programId: string, fromStart: boolean = false) => {
    if (selectedChannel) {
      navigate(`/watch/${selectedChannel}${fromStart ? '?from_start=true' : ''}`);
    }
  };

  if (channelsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">TV en Vivo</h1>

        {!channels || channels.length === 0 ? (
          <p className="text-muted-foreground">No hay canales disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className="bg-card rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-glow hover:scale-105 animate-fade-in group"
              >
                <div className="aspect-video bg-secondary flex items-center justify-center overflow-hidden relative">
                  {channel.cover_image_url ? (
                    <img 
                      src={channel.cover_image_url} 
                      alt={channel.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="text-4xl">📺</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">EN VIVO</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{channel.title}</h3>
                  {channel.current_program && (
                    <p className="text-xs text-muted-foreground mb-2">{channel.current_program.title}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Ver Programación</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
          <DialogContent className="max-w-full sm:max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedChannelData?.cover_image_url && (
                  <img 
                    src={selectedChannelData.cover_image_url} 
                    alt=""
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
                  />
                )}
                <span className="text-lg sm:text-xl">
                  {selectedChannelData?.title}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs 
              value={selectedDate.toISOString()} 
              onValueChange={(value) => setSelectedDate(new Date(value))}
            >
              <TabsList className="grid w-full grid-cols-7 mb-4 h-auto">
                {epgDays.map((day) => (
                  <TabsTrigger 
                    key={day.date.toISOString()} 
                    value={day.date.toISOString()} 
                    className="text-[10px] sm:text-xs px-1 sm:px-3 py-2"
                  >
                    <span className="hidden sm:inline">{day.label}</span>
                    <span className="sm:hidden">{day.label.slice(0, 3)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {epgDays.map((day) => (
                <TabsContent key={day.date.toISOString()} value={day.date.toISOString()} className="space-y-2 sm:space-y-3">
                  {epgLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : !epgData || epgData.length === 0 ? (
                    <p className="text-center text-muted-foreground p-8">
                      No hay programación disponible para este día.
                    </p>
                  ) : (
                    epgData.map((program) => (
                      <div
                        key={program.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors group border border-border"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium mb-1 text-sm sm:text-base">{program.program_title}</h4>
                          {program.program_description && (
                            <p className="text-xs text-muted-foreground mb-2">{program.program_description}</p>
                          )}
                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(program.start_time)} - {formatTime(program.end_time)}
                            </span>
                            <span>{formatDuration(program.duration_minutes)}</span>
                            {program.genre && <span className="text-primary">{program.genre}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="flex-1 sm:flex-none text-xs"
                            onClick={() => handlePlayProgram(program.id, true)}
                          >
                            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Ver desde inicio</span>
                            <span className="sm:hidden">Inicio</span>
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 sm:flex-none text-xs"
                            onClick={() => handlePlayProgram(program.id)}
                          >
                            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Ver ahora</span>
                            <span className="sm:hidden">Ver</span>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LiveTV;
