import { useState } from "react";
import { useEvents, useCreateEvent, useDeleteEvent } from "@/hooks/use-events";
import { Layout } from "@/components/layout";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, CalendarDays, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Events() {
  const { data: events, isLoading } = useEvents();
  const { mutateAsync: createEvent, isPending } = useCreateEvent();
  const { mutateAsync: deleteEvent } = useDeleteEvent();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent({
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
      toast({ title: "Evento criado com sucesso" });
      setIsOpen(false);
      setFormData({ name: "", date: "", description: "" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja cancelar e excluir este evento?")) return;
    try {
      await deleteEvent(id);
      toast({ title: "Evento excluído" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

  // Sort events by date ascending
  const sortedEvents = events ? [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight">Eventos</h2>
            <p className="text-muted-foreground mt-1">Agenda e programação da igreja.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="hover-elevate bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Novo Evento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome do Evento *</Label>
                  <Input 
                    required 
                    placeholder="Ex: Culto de Jovens"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data e Hora *</Label>
                  <Input 
                    required
                    type="datetime-local"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    placeholder="Detalhes adicionais..."
                    className="resize-none"
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isPending} className="w-full sm:w-auto hover-elevate">
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Criar Evento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/50" /></div>
        ) : sortedEvents.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 p-16 text-center text-muted-foreground flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">Sua agenda está vazia</h3>
            <p className="max-w-sm mx-auto">Nenhum evento programado. Clique no botão acima para adicionar um novo culto, reunião ou atividade.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedEvents.map(event => (
              <Card key={event.id} className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg line-clamp-1">{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="flex items-center text-sm font-medium text-purple-700 bg-purple-50 p-2 rounded-lg mb-3">
                    <Clock className="w-4 h-4 mr-2" />
                    {format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm")}
                  </div>
                  {event.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50 italic">
                      Sem descrição adicional.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-0 justify-end border-t border-border/20 mt-auto bg-slate-50/30 p-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(event.id)} 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
