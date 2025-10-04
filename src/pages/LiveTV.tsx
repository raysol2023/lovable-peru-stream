import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockChannels, mockPrograms } from '@/data/mockData';
import { Clock } from 'lucide-react';

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const getChannelPrograms = (channelId: string) => {
    return mockPrograms.filter(p => p.channelId === channelId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in">TV en Vivo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className="bg-card rounded-lg p-6 cursor-pointer transition-all hover:shadow-glow hover:scale-105 animate-fade-in"
            >
              <div className="text-6xl mb-4 text-center">{channel.logo}</div>
              <h3 className="text-xl font-semibold text-center mb-2">{channel.name}</h3>
              <p className="text-sm text-muted-foreground text-center">{channel.category}</p>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Ver programación</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedChannel && mockChannels.find(c => c.id === selectedChannel)?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Programación de Hoy</h3>
              {selectedChannel && getChannelPrograms(selectedChannel).map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{program.title}</h4>
                    <p className="text-sm text-muted-foreground">{program.duration}</p>
                  </div>
                  <span className="text-primary font-semibold">{program.time}</span>
                </div>
              ))}
              
              <Button className="w-full shadow-glow">
                Ver Ahora
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LiveTV;
