import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockCommunityRequests } from '@/data/mockData';
import { ThumbsUp, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Community = () => {
  const [requests, setRequests] = useState(mockCommunityRequests);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitud enviada",
      description: "Tu solicitud ha sido enviada a la comunidad",
    });
    setNewTitle('');
    setNewDescription('');
  };

  const handleVote = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, votes: req.votes + 1 } : req
    ));
    toast({
      title: "Voto registrado",
      description: "Tu voto ha sido contabilizado",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 animate-fade-in">Comunidad</h1>
        <p className="text-muted-foreground mb-8">
          Solicita nuevos títulos y vota por los que quieres ver
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Solicitudes Activas</h2>
            
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-card rounded-lg p-6 transition-all hover:shadow-glow animate-fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{request.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Solicitado por {request.requestedBy} • {request.date}
                    </p>
                  </div>
                  {getStatusIcon(request.status)}
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleVote(request.id)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {request.votes} votos
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comentarios
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-card rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-4">Nueva Solicitud</h2>
              
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nombre de la película o serie"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="¿Por qué deberíamos agregar este título?"
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full shadow-glow">
                  Enviar Solicitud
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
