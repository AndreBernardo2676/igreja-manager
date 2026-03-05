import { useStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, CalendarDays, Loader2, ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();

  const formatCurrency = (cents: number | undefined) => {
    if (cents === undefined) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-lg">Visão geral da sua congregação este mês.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Membros</CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-foreground">
                {stats?.totalMembers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1 text-emerald-500" /> 
                Membros ativos na comunidade
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entradas (Mês)</CardTitle>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-foreground">
                {formatCurrency(stats?.monthlyFinances)}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                Dízimos e ofertas do mês atual
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Programados</CardTitle>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-foreground">
                {stats?.totalEvents || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                Atividades registradas no calendário
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for future features or elegant empty state for charts */}
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader>
            <CardTitle>Resumo Recente</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-primary/5 rounded-full mb-4">
              <LayoutDashboard className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-muted-foreground font-medium">O sistema está operando perfeitamente.</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Utilize o menu lateral para gerenciar membros, registrar contribuições financeiras ou agendar eventos da igreja.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
