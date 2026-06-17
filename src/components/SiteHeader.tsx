import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      } else {
        setIsAdmin(false);
      }
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-9" />
        </Link>
        <nav className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/blog">Blog</Link>
            </Button>
            {email ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/curso">Meu curso</Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin">Admin</Link>
                  </Button>
                )}
                <Button onClick={signOut} variant="outline" size="sm">
                  Sair
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="bg-primary text-primary-foreground">
                <Link to="/auth">Entrar</Link>
              </Button>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-8 flex flex-col gap-2">
                <Button asChild variant="ghost" className="justify-start text-base">
                  <Link to="/">Início</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start text-base">
                  <Link to="/blog">Blog</Link>
                </Button>
                {email ? (
                  <>
                    <Button asChild variant="ghost" className="justify-start text-base">
                      <Link to="/curso">Meu curso</Link>
                    </Button>
                    {isAdmin && (
                      <Button asChild variant="ghost" className="justify-start text-base">
                        <Link to="/admin">Admin</Link>
                      </Button>
                    )}
                    <div className="mt-2 pt-2 border-t border-border">
                      <Button onClick={signOut} variant="outline" className="w-full">
                        Sair
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 pt-2 border-t border-border">
                    <Button asChild className="w-full bg-primary text-primary-foreground">
                      <Link to="/auth">Entrar</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
