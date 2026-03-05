import { useState } from "react";
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from "@/hooks/use-members";
import { Layout } from "@/components/layout";
import { format } from "date-fns";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Members() {
  const { data: members, isLoading } = useMembers();
  const { mutateAsync: createMember, isPending: isCreating } = useCreateMember();
  const { mutateAsync: updateMember, isPending: isUpdating } = useUpdateMember();
  const { mutateAsync: deleteMember } = useDeleteMember();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    role: "membro"
  });

  const filteredMembers = members?.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleOpenEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      phone: member.phone || "",
      email: member.email || "",
      birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : "",
      role: member.role,
    });
    setIsOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", birthDate: "", role: "membro" });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
      };

      if (editingId) {
        await updateMember({ id: editingId, ...payload });
        toast({ title: "Membro atualizado com sucesso" });
      } else {
        await createMember(payload);
        toast({ title: "Membro cadastrado com sucesso" });
      }
      setIsOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;
    try {
      await deleteMember(id);
      toast({ title: "Membro removido" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'pastor': return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Pastor</Badge>;
      case 'lider': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Líder</Badge>;
      default: return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100">Membro</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight">Membros</h2>
            <p className="text-muted-foreground mt-1">Gerencie as pessoas da sua congregação.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="hover-elevate">
                <Plus className="w-4 h-4 mr-2" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Membro" : "Cadastrar Membro"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="João Silva"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo *</Label>
                    <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membro">Membro</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                        <SelectItem value="pastor">Pastor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="joao@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <Input 
                      type="date"
                      value={formData.birthDate}
                      onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isCreating || isUpdating} className="w-full sm:w-auto hover-elevate">
                    {(isCreating || isUpdating) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingId ? "Salvar Alterações" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou email..." 
                className="pl-9 bg-slate-50/50 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary/50" /></div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="font-medium text-lg">Nenhum membro encontrado</p>
              <p className="text-sm">Cadastre novos membros para vê-los aqui.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[300px]">Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Aniversário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex flex-col">
                        <span>{member.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">{member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.phone || '-'}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.birthDate ? format(new Date(member.birthDate), "dd/MM/yyyy") : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(member)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
}
