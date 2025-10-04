import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockChannels, mockPrograms, mockEPGDays } from '@/data/mockData';
import { Clock, Play, RotateCcw } from 'lucide-react';

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(mockEPGDays[0].date);

  const getChannelPrograms = (channelId: string) => {
    return mockPrograms.filter(p => p.channelId === channelId);
  };

  const channelLogos: Record<string, string> = {
    '1': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&h=200&fit=crop',
    '2': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop',
    '3': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=200&fit=crop',
    '4': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop',
    '5': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">TV en Vivo</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mockChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className="bg-card rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-glow hover:scale-105 animate-fade-in group"
            >
              <div className="aspect-video bg-secondary flex items-center justify-center overflow-hidden relative">
                {channelLogos[channel.id] ? (
                  <img 
                    src={channelLogos[channel.id]} 
                    alt={channel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="text-6xl">{channel.logo}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">EN VIVO</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{channel.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{channel.category}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Programación</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
          <DialogContent className="max-w-full sm:max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedChannel && channelLogos[selectedChannel] && (
                  <img 
                    src={channelLogos[selectedChannel]} 
                    alt=""
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
                  />
                )}
                <span className="text-lg sm:text-xl">
                  {selectedChannel && mockChannels.find(c => c.id === selectedChannel)?.name}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={selectedDay} onValueChange={setSelectedDay}>
              <TabsList className="grid w-full grid-cols-7 mb-4 h-auto">
                {mockEPGDays.map((day) => (
                  <TabsTrigger 
                    key={day.date} 
                    value={day.date} 
                    className="text-[10px] sm:text-xs px-1 sm:px-3 py-2"
                  >
                    <span className="hidden sm:inline">{day.day}</span>
                    <span className="sm:hidden">{day.day.slice(0, 3)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {mockEPGDays.map((day) => (
                <TabsContent key={day.date} value={day.date} className="space-y-2 sm:space-y-3">
                  {selectedChannel && getChannelPrograms(selectedChannel).map((program) => (
                    <div
                      key={program.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors group border border-border"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium mb-1 text-sm sm:text-base">{program.title}</h4>
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {program.time}
                          </span>
                          <span>{program.duration}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" className="flex-1 sm:flex-none text-xs">
                          <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Ver desde inicio</span>
                          <span className="sm:hidden">Inicio</span>
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none text-xs">
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Ver ahora</span>
                          <span className="sm:hidden">Ver</span>
                        </Button>
                      </div>
                    </div>
                  ))}
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
