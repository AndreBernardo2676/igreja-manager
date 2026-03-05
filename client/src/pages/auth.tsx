import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Church, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginParams = useLogin();
  const registerParams = useRegister();

  const handleAuth = async (action: "login" | "register", e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (action === "login") {
        await loginParams.mutateAsync({ username, password });
        toast({ title: "Bem-vindo de volta!" });
      } else {
        await registerParams.mutateAsync({ username, password });
        toast({ title: "Conta criada com sucesso!" });
      }
      setLocation("/");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: err.message,
      });
    }
  };

  const isPending = loginParams.isPending || registerParams.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8 text-primary">
          <div className="p-3 bg-white rounded-2xl shadow-sm border mb-4">
            <Church className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Koinonia</h1>
          <p className="text-muted-foreground mt-1">Sistema de Gestão de Igreja</p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/[0.02]">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100">
                <TabsTrigger value="login" className="rounded-md">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="rounded-md">Cadastrar</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={(e) => handleAuth("login", e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-user">Usuário</Label>
                    <Input
                      id="login-user"
                      required
                      className="bg-slate-50/50"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-pass">Senha</Label>
                    <Input
                      id="login-pass"
                      type="password"
                      required
                      className="bg-slate-50/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full hover-elevate" disabled={isPending}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Acessar Sistema
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <form onSubmit={(e) => handleAuth("register", e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-user">Novo Usuário</Label>
                    <Input
                      id="reg-user"
                      required
                      className="bg-slate-50/50"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Nova Senha</Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      required
                      className="bg-slate-50/50"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full hover-elevate" disabled={isPending}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Criar Conta
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
