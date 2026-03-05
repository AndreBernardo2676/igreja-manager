import { useState } from "react";
import { useFinances, useCreateFinance, useDeleteFinance } from "@/hooks/use-finances";
import { useMembers } from "@/hooks/use-members";
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
import { Plus, Trash2, Wallet, Loader2, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Finances() {
  const { data: finances, isLoading } = useFinances();
  const { data: members } = useMembers();
  const { mutateAsync: createFinance, isPending } = useCreateFinance();
  const { mutateAsync: deleteFinance } = useDeleteFinance();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "dizimo",
    amountStr: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "pix",
    memberId: "none"
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse amount string (e.g. "150,50" or "150.50") to cents
      const cleanStr = formData.amountStr.replace(',', '.');
      const amountFloat = parseFloat(cleanStr);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Valor inválido");
      }
      const amountInCents = Math.round(amountFloat * 100);

      const payload = {
        type: formData.type,
        amount: amountInCents,
        date: new Date(formData.date).toISOString(),
        paymentMethod: formData.paymentMethod,
        memberId: formData.memberId !== "none" ? parseInt(formData.memberId) : undefined,
      };

      await createFinance(payload);
      toast({ title: "Lançamento registrado com sucesso" });
      setIsOpen(false);
      setFormData({ ...formData, amountStr: "" }); // Reset form amount
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este lançamento financeiro?")) return;
    try {
      await deleteFinance(id);
      toast({ title: "Lançamento removido" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight">Finanças</h2>
            <p className="text-muted-foreground mt-1">Controle de dízimos e ofertas da congregação.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="hover-elevate bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Registrar Entrada Financeira</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Lançamento</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dizimo">Dízimo</SelectItem>
                        <SelectItem value="oferta">Oferta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor (R$) *</Label>
                    <Input 
                      required 
                      placeholder="0,00"
                      value={formData.amountStr}
                      onChange={e => setFormData({...formData, amountStr: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Input 
                      required
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({...formData, paymentMethod: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Membro Vinculado (Opcional)</Label>
                  <Select value={formData.memberId} onValueChange={(val) => setFormData({...formData, memberId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não vinculado / Anônimo</SelectItem>
                      {members?.map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isPending} className="w-full sm:w-auto hover-elevate">
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Registrar Entrada
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary/50" /></div>
          ) : !finances || finances.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="font-medium text-lg text-foreground">Nenhum lançamento encontrado</p>
              <p className="text-sm mt-1">Registre novos dízimos e ofertas para visualizar aqui.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Membro</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finances.map((finance) => {
                  const member = members?.find(m => m.id === finance.memberId);
                  return (
                    <TableRow key={finance.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-muted-foreground font-medium">
                        {format(new Date(finance.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={finance.type === 'dizimo' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}>
                          {finance.type === 'dizimo' ? 'Dízimo' : 'Oferta'}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground text-sm">
                        {finance.paymentMethod}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member ? member.name : <span className="italic text-muted-foreground/60">Não informado</span>}
                      </TableCell>
                      <TableCell className="text-right font-display font-semibold text-emerald-600 flex items-center justify-end gap-1">
                        <ArrowUpCircle className="w-3 h-3" />
                        {formatCurrency(finance.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(finance.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
}
