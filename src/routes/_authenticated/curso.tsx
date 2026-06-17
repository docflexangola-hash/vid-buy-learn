import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { COURSE } from "@/lib/course";
import { getSiteConfig, type SiteConfigData } from "@/lib/api/config.functions";
import {
  Lock,
  PlayCircle,
  CheckCircle2,
  FileText,
  Download,
  MessageSquare,
  GraduationCap,
  Smartphone,
} from "lucide-react";
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
type Material = {
  id: string;
  lesson_id: string;
  title: string;
  file_type: string;
  file_url: string;
};
type QuizQuestion = {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_index: number;
};
type Comment = {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { full_name: string | null; email: string | null } | null;
  is_admin?: boolean;
};

function toEmbed(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const shortsMatch = u.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname === "vimeo.com" || u.hostname === "player.vimeo.com") {
      const vimeoId = u.pathname.split("/").pop();
      if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
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
  const [userName, setUserName] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfigData | null>(null);

  const loadCurrentLessonData = async (lessonId: string) => {
    const [matRes, quizRes, commRes] = await Promise.all([
      supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).order("created_at"),
      supabase.from("lesson_quizzes").select("*").eq("lesson_id", lessonId).order("position"),
      supabase
        .from("lesson_comments")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false }),
    ]);
    setMaterials((matRes.data ?? []) as Material[]);
    setQuizzes((quizRes.data ?? []) as QuizQuestion[]);

    const comms = (commRes.data ?? []) as Comment[];
    const ids = [...new Set(comms.map((c) => c.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .in("user_id", ids);
      const adminIds = new Set((roles ?? []).map((r) => r.user_id));
      comms.forEach((c) => {
        const p = map.get(c.user_id);
        c.profile = p ? { full_name: p.full_name, email: p.email } : null;
        c.is_admin = adminIds.has(c.user_id);
      });
    }
    setComments(comms);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user || cancelled) return;
        setUserId(u.user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", u.user.id)
          .single();
        setUserName(profile?.full_name || "");

        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.user.id);
        setIsAdmin(!!roles?.some((r) => r.role === "admin"));

        getSiteConfig().then((data) => {
          if (!cancelled) setSiteConfig(data);
        });

        const { data: enr } = await supabase
          .from("enrollments")
          .select("status")
          .eq("user_id", u.user.id)
          .maybeSingle();
        if (cancelled) return;

        if (isAdmin) {
          setStatus("active");
        } else if (!enr) {
          setStatus("none");
          return;
        } else if (enr.status !== "active") {
          setStatus("pending");
          return;
        } else {
          setStatus("active");
        }

        const { data: ls } = await supabase
          .from("lessons")
          .select("*")
          .order("position", { ascending: true });
        if (cancelled) return;
        const list = (ls ?? []) as Lesson[];
        setLessons(list);
        if (list.length) {
          setCurrent(list[0]);
          loadCurrentLessonData(list[0].id);
        }

        const { data: pr } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", u.user.id);
        if (cancelled) return;
        setProgress(new Set((pr ?? []).map((p) => p.lesson_id)));
      } catch {
        if (!cancelled) {
          toast.error("Erro ao carregar o curso. Tente novamente.");
          setStatus("none");
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (current) loadCurrentLessonData(current.id);
  }, [current?.id]);

  const requestAccess = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: userId, status: "pending" });
    if (error) return toast.error(error.message);
    toast.success("Pedido registado! Aguarde a liberação do acesso.");
    setStatus("pending");
  };

  const toggleDone = async (lesson: Lesson, done: boolean) => {
    if (!userId) return;
    if (done) {
      const { error } = await supabase
        .from("lesson_progress")
        .insert({ user_id: userId, lesson_id: lesson.id });
      if (error) return toast.error(error.message);
      setProgress(new Set([...progress, lesson.id]));
    } else {
      const { error } = await supabase
        .from("lesson_progress")
        .delete()
        .eq("user_id", userId)
        .eq("lesson_id", lesson.id);
      if (error) return toast.error(error.message);
      const n = new Set(progress);
      n.delete(lesson.id);
      setProgress(n);
    }
  };

  const postComment = async () => {
    if (!userId || !current || !newComment.trim()) return;
    const { error } = await supabase.from("lesson_comments").insert({
      lesson_id: current.id,
      user_id: userId,
      content: newComment.trim(),
    });
    if (error) return toast.error(error.message);
    setNewComment("");
    loadCurrentLessonData(current.id);
  };

  const allDone = lessons.length > 0 && lessons.every((l) => progress.has(l.id));

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          A carregar...
        </div>
      </div>
    );
  }

  if (status === "none" || status === "pending") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
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
                <li>
                  <span className="font-medium text-foreground">Banco:</span>{" "}
                  {siteConfig?.payment_bank ?? COURSE.paymentInstructions.bank}
                </li>
                <li>
                  <span className="font-medium text-foreground">IBAN:</span>{" "}
                  <span className="font-mono">
                    {siteConfig?.payment_iban ?? COURSE.paymentInstructions.iban}
                  </span>
                </li>
                <li>
                  <span className="font-medium text-foreground">Titular:</span>{" "}
                  {siteConfig?.payment_holder ?? COURSE.paymentInstructions.holder}
                </li>
                <li>
                  <span className="font-medium text-foreground">Valor:</span>{" "}
                  {siteConfig?.price_label ?? COURSE.priceLabel}
                </li>
              </ul>
              <p className="mt-3 text-xs">
                {siteConfig?.payment_note ?? COURSE.paymentInstructions.note}
              </p>
            </div>
            {status === "none" && (
              <Button onClick={requestAccess} className="bg-primary text-primary-foreground">
                Registar pedido de inscrição
              </Button>
            )}
            <div className="mt-4">
              <Link to="/" className="text-sm text-muted-foreground underline">
                Voltar à página inicial
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">{COURSE.name}</h1>
        <p className="text-muted-foreground">
          {lessons.length} aula{lessons.length === 1 ? "" : "s"} • {progress.size} concluída
          {progress.size === 1 ? "" : "s"}
        </p>

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
                  {current?.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{current.description}</p>
                  )}
                  {current && (
                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={progress.has(current.id)}
                        onCheckedChange={(c) => {
                          if (c !== "indeterminate") toggleDone(current, c);
                        }}
                      />
                      Marcar como concluída
                    </label>
                  )}
                </div>
              </Card>

              {/* Materials */}
              {materials.length > 0 && (
                <Card className="mt-4 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <FileText className="h-4 w-4" /> Materiais de Apoio
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {materials.map((m) => (
                      <li key={m.id}>
                        <a
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm hover:bg-secondary/80"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-gold" />
                          <span className="flex-1 truncate">{m.title}</span>
                          <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Quiz */}
              {current && quizzes.length > 0 && (
                <QuizSection quizQuestions={quizzes} userId={userId} />
              )}

              {/* Comments */}
              {current && (
                <Card className="mt-4 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <MessageSquare className="h-4 w-4" /> Comentários ({comments.length})
                  </h3>
                  <div className="mt-4 space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tens alguma dúvida sobre esta aula?"
                      className="min-h-[80px] text-sm"
                    />
                    <Button size="sm" onClick={postComment} disabled={!newComment.trim()}>
                      Comentar
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum comentário ainda. Sê o primeiro a comentar!
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="rounded-lg bg-secondary p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{c.profile?.full_name || "Anónimo"}</span>
                            {c.is_admin && (
                              <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-gold-foreground">
                                Professor
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString("pt-PT")}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              )}
            </div>

            <div>
              <Card className="p-4">
                <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aulas
                </p>
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
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
                          ) : (
                            <PlayCircle className="h-4 w-4 shrink-0 opacity-70" />
                          )}
                          <span className="flex-1 truncate">
                            {i + 1}. {l.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              {/* WhatsApp Settings */}
              <Card className="mt-4 p-6">
                <WhatsAppSettings userId={userId} />
              </Card>

              {/* Certificate */}
              {allDone && (
                <Card className="mt-4 p-6 text-center">
                  <GraduationCap className="mx-auto h-10 w-10 text-gold" />
                  <h3 className="mt-2 text-sm font-semibold text-primary">
                    Parabéns! Completaste todas as aulas!
                  </h3>
                  <CertificateRequestSection userId={userId} userName={userName} />
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizSection({
  quizQuestions,
  userId,
}: {
  quizQuestions: QuizQuestion[];
  userId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct_index) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <Card className="mt-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <GraduationCap className="h-4 w-4" /> Quiz ({quizQuestions.length} perguntas)
        </h3>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) reset();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              Fazer Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Quiz da aula</DialogTitle>
            </DialogHeader>
            {!submitted ? (
              <div className="space-y-6">
                {quizQuestions.map((q, i) => (
                  <div key={q.id}>
                    <p className="mb-2 text-sm font-medium">
                      {i + 1}. {q.question}
                    </p>
                    <div className="space-y-1">
                      {(q.options as string[]).map((opt, j) => (
                        <label
                          key={j}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition ${
                            answers[q.id] === j
                              ? "border-primary bg-primary/5"
                              : "hover:bg-secondary"
                          }`}
                          onClick={() => setAnswers({ ...answers, [q.id]: j })}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={answers[q.id] === j}
                            onChange={() => {}}
                            className="sr-only"
                          />
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${answers[q.id] === j ? "border-primary bg-primary" : "border-muted-foreground"}`}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < quizQuestions.length}
                  className="w-full"
                >
                  Ver resultados
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-lg font-bold">
                  {score}/{quizQuestions.length} corretas
                </p>
                <p className="text-muted-foreground">
                  {score === quizQuestions.length
                    ? "Perfeito! Acertaste tudo!"
                    : score >= quizQuestions.length / 2
                      ? "Bom trabalho!"
                      : "Continua a praticar!"}
                </p>
                <div className="space-y-2 text-left">
                  {quizQuestions.map((q, i) => (
                    <div
                      key={q.id}
                      className={`rounded-lg p-3 text-sm ${answers[q.id] === q.correct_index ? "bg-green-50" : "bg-red-50"}`}
                    >
                      <p className="font-medium">
                        {i + 1}. {q.question}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {answers[q.id] === q.correct_index
                          ? "✓ Correta"
                          : `✗ Errada. Resposta correta: ${(q.options as string[])[q.correct_index]}`}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={reset} className="w-full">
                  Refazer quiz
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}

function CertificateRequestSection({
  userId,
  userName,
}: {
  userId: string | null;
  userName: string;
}) {
  const [request, setRequest] = useState<{
    status: string;
    certificate_url: string | null;
    rejection_reason: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("certificate_requests")
      .select("status, certificate_url, rejection_reason")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setRequest(
          data as {
            status: string;
            certificate_url: string | null;
            rejection_reason: string | null;
          } | null,
        );
        setLoading(false);
      });
  }, [userId]);

  const requestCert = async () => {
    if (!userId) return;
    const { error } = await supabase.from("certificate_requests").insert({
      user_id: userId,
      status: "pending",
    });
    if (error) return toast.error(error.message);
    toast.success("Pedido de certificado registado! Aguarda a aprovação.");
    setRequest({ status: "pending", certificate_url: null, rejection_reason: null });
  };

  if (loading) return <p className="mt-3 text-xs text-muted-foreground">A carregar...</p>;

  if (!request) {
    return (
      <Button
        size="sm"
        onClick={requestCert}
        className="mt-3 bg-gold text-gold-foreground hover:bg-gold/90"
      >
        <GraduationCap className="mr-1 h-4 w-4" /> Solicitar Certificado
      </Button>
    );
  }

  return (
    <div className="mt-3">
      {request.status === "pending" && (
        <p className="text-sm text-muted-foreground">
          Pedido de certificado enviado. Aguarda a aprovação do administrador.
        </p>
      )}
      {request.status === "approved" && (
        <div>
          <p className="text-sm text-green-600">Certificado aprovado! 🎉</p>
          {request.certificate_url ? (
            <a href={request.certificate_url} target="_blank" rel="noopener noreferrer" download>
              <Button size="sm" className="mt-2 bg-gold text-gold-foreground hover:bg-gold/90">
                <Download className="mr-1 h-4 w-4" /> Descarregar Certificado
              </Button>
            </a>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">A preparar o download...</p>
          )}
        </div>
      )}
      {request.status === "rejected" && (
        <div>
          <p className="text-sm text-red-600">Certificado rejeitado.</p>
          {request.rejection_reason && (
            <p className="mt-1 text-xs text-muted-foreground">Motivo: {request.rejection_reason}</p>
          )}
        </div>
      )}
    </div>
  );
}

function WhatsAppSettings({ userId }: { userId: string | null }) {
  const [number, setNumber] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("whatsapp_number")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data?.whatsapp_number) setNumber(data.whatsapp_number);
        setLoading(false);
      });
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    const cleaned = number.replace(/\s+/g, "");
    if (cleaned && !/^\+?\d{7,15}$/.test(cleaned)) {
      return toast.error("Número inválido. Ex: +244900000000");
    }
    const { error } = await supabase
      .from("profiles")
      .update({ whatsapp_number: cleaned || null })
      .eq("id", userId);
    if (error) return toast.error(error.message);
    setSaved(true);
    toast.success("Número guardado! Receberás notificações por WhatsApp.");
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <p className="text-xs text-muted-foreground">A carregar...</p>;

  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Smartphone className="h-4 w-4" /> Notificações WhatsApp
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Regista o teu número para receber notificações (matrícula ativada, certificado, etc.)
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="tel"
          placeholder="+244900000000"
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:flex-1"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <Button size="sm" onClick={save}>
          {saved ? "Guardado" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
