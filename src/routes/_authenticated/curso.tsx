import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { COURSE } from "@/lib/course";
import { Lock, PlayCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/curso")({
  head: () => ({ meta: [{ title: `${COURSE.name} — Área do aluno` }] }),
  component: CursoPage,
});

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  position: number;
};

function toEmbed(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.pathname.includes("/embed/")) return url;
    return url;
  } catch {
    return url;
  }
}

function CursoPage() {
  const [status, setStatus] = useState<"loading" | "pending" | "none" | "active">("loading");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState<Lesson | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);

      const { data: enr } = await supabase
        .from("enrollments")
        .select("status")
        .eq("user_id", u.user.id)
        .maybeSingle();

      if (!enr) {
        setStatus("none");
        return;
      }
      if (enr.status !== "active") {
        setStatus("pending");
        return;
      }
      setStatus("active");

      const { data: ls } = await supabase
        .from("lessons")
        .select("*")
        .order("position", { ascending: true });
      const list = (ls ?? []) as Lesson[];
      setLessons(list);
      if (list.length) setCurrent(list[0]);

      const { data: pr } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", u.user.id);
      setProgress(new Set((pr ?? []).map((p) => p.lesson_id)));
    };
    load();
  }, []);

  const requestAccess = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, status: "pending" });
    if (error) return toast.error(error.message);
    toast.success("Pedido registado! Aguarde a liberação do acesso.");
    setStatus("pending");
  };

  const toggleDone = async (lesson: Lesson) => {
    if (!userId) return;
    if (progress.has(lesson.id)) {
      await supabase.from("lesson_progress").delete().eq("user_id", userId).eq("lesson_id", lesson.id);
      const n = new Set(progress); n.delete(lesson.id); setProgress(n);
    } else {
      await supabase.from("lesson_progress").insert({ user_id: userId, lesson_id: lesson.id });
      setProgress(new Set([...progress, lesson.id]));
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">A carregar...</div>
      </div>
    );
  }

  if (status === "none" || status === "pending") {
    return (
      <div className="min-h-screen"><SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-16">
          <Card className="p-8 text-center">
            <Lock className="mx-auto h-12 w-12 text-gold" />
            <h1 className="mt-4 text-2xl font-bold text-primary">
              {status === "pending" ? "A aguardar liberação" : "Acesso ainda não ativo"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {status === "pending"
                ? "O seu pedido foi recebido. Após confirmação do pagamento, o acesso é liberado em até 24h."
                : "Para começar, registe o seu pedido de inscrição. Em seguida, efetue o pagamento."}
            </p>

            <div className="my-6 rounded-xl bg-secondary p-6 text-left text-sm">
              <p className="font-semibold text-primary">Dados para pagamento</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li><span className="font-medium text-foreground">Banco:</span> {COURSE.paymentInstructions.bank}</li>
                <li><span className="font-medium text-foreground">IBAN:</span> <span className="font-mono">{COURSE.paymentInstructions.iban}</span></li>
                <li><span className="font-medium text-foreground">Titular:</span> {COURSE.paymentInstructions.holder}</li>
                <li><span className="font-medium text-foreground">Valor:</span> {COURSE.priceLabel}</li>
              </ul>
              <p className="mt-3 text-xs">{COURSE.paymentInstructions.note}</p>
            </div>

            {status === "none" && (
              <Button onClick={requestAccess} className="bg-primary text-primary-foreground">
                Registar pedido de inscrição
              </Button>
            )}
            <div className="mt-4">
              <Link to="/" className="text-sm text-muted-foreground underline">Voltar à página inicial</Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen"><SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">{COURSE.name}</h1>
        <p className="text-muted-foreground">{lessons.length} aula{lessons.length === 1 ? "" : "s"} • {progress.size} concluída{progress.size === 1 ? "" : "s"}</p>

        {lessons.length === 0 ? (
          <Card className="mt-8 p-10 text-center text-muted-foreground">
            Em breve as aulas estarão disponíveis aqui.
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden p-0">
                {current && (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      key={current.id}
                      src={toEmbed(current.video_url)}
                      title={current.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-primary">{current?.title}</h2>
                  {current?.description && <p className="mt-2 text-sm text-muted-foreground">{current.description}</p>}
                  {current && (
                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox checked={progress.has(current.id)} onCheckedChange={() => toggleDone(current)} />
                      Marcar como concluída
                    </label>
                  )}
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-4">
                <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aulas</p>
                <ul className="mt-2 space-y-1">
                  {lessons.map((l, i) => {
                    const done = progress.has(l.id);
                    const isCurrent = current?.id === l.id;
                    return (
                      <li key={l.id}>
                        <button
                          onClick={() => setCurrent(l)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                            isCurrent ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                          }`}
                        >
                          {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" /> : <PlayCircle className="h-4 w-4 shrink-0 opacity-70" />}
                          <span className="flex-1 truncate">{i + 1}. {l.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
