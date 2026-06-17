import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Ondjango Capital" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");

  // signin
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [siLoading, setSiLoading] = useState(false);

  // signup
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suLoading, setSuLoading] = useState(false);

  // reset
  const [rstEmail, setRstEmail] = useState("");
  const [rstLoading, setRstLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/curso" });
    });
  }, [navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: siEmail,
      password: siPass,
    });
    setSiLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo!");
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", signInData.user.id);
    const isAdmin = !!roles?.some((r) => r.role === "admin");
    navigate({ to: isAdmin ? "/admin" : "/curso" });
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPass,
      options: {
        emailRedirectTo: `${window.location.origin}/curso`,
        data: { full_name: suName },
      },
    });
    setSuLoading(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success("Conta criada! Pode entrar agora.");
      setTab("signin");
      setSiEmail(suEmail);
    } else {
      toast.success("Conta criada! Verifique o seu email para confirmar o registo.");
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRstLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(rstEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setRstLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Enviámos um email com instruções.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex justify-center">
          <Logo className="h-14" />
        </Link>
        <Card className="border-border/60 p-6 md:p-8">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
              <TabsTrigger value="reset">Recuperar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={onSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    required
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pass">Senha</Label>
                  <Input
                    id="si-pass"
                    type="password"
                    required
                    value={siPass}
                    onChange={(e) => setSiPass(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={siLoading}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {siLoading ? "A entrar..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={onSignUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Nome completo</Label>
                  <Input
                    id="su-name"
                    required
                    value={suName}
                    onChange={(e) => setSuName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    required
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pass">Senha (mín. 6)</Label>
                  <Input
                    id="su-pass"
                    type="password"
                    required
                    minLength={6}
                    value={suPass}
                    onChange={(e) => setSuPass(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={suLoading}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {suLoading ? "A criar..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset">
              <form onSubmit={onReset} className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Enviaremos um link para repor a sua senha.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="rst-email">Email</Label>
                  <Input
                    id="rst-email"
                    type="email"
                    required
                    value={rstEmail}
                    onChange={(e) => setRstEmail(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={rstLoading}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {rstLoading ? "A enviar..." : "Enviar link"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/" className="underline">
            ← Voltar à página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}
