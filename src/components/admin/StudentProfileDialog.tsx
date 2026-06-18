import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import type { Student } from "./types";

export function StudentProfileDialog({
  student,
  open,
  onOpenChange,
}: {
  student: Student | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!student) return null;
  const [profile, setProfile] = useState<{
    full_name: string | null;
    email: string | null;
    whatsapp_number: string | null;
    created_at: string;
  } | null>(null);
  const [progress, setProgress] = useState<{ lesson_id: string; title: string; done: boolean }[]>(
    [],
  );
  const [quizAttempts, setQuizAttempts] = useState<
    { score: number; total: number; passed: boolean; created_at: string }[]
  >([]);
  const [comments, setComments] = useState<number>(0);
  const [certRequest, setCertRequest] = useState<{
    status: string;
    rejection_reason: string | null;
  } | null>(null);

  useEffect(() => {
    if (!open || !student) return;
    const load = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, email, whatsapp_number, created_at")
        .eq("id", student.user_id)
        .single();
      setProfile(prof as typeof profile);

      const { data: ls } = await supabase.from("lessons").select("id, title").order("position");
      const allLessons = (ls ?? []) as { id: string; title: string }[];
      const { data: pr } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", student.user_id);
      const doneSet = new Set((pr ?? []).map((p) => p.lesson_id));
      setProgress(
        allLessons.map((l) => ({ lesson_id: l.id, title: l.title, done: doneSet.has(l.id) })),
      );

      const { data: quiz } = await supabase
        .from("quiz_attempts")
        .select("score, total, passed, created_at")
        .eq("user_id", student.user_id)
        .order("created_at", { ascending: false });
      setQuizAttempts((quiz ?? []) as typeof quizAttempts);

      const { count: commCount } = await supabase
        .from("lesson_comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", student.user_id);
      setComments(commCount ?? 0);

      const { data: cert } = await supabase
        .from("certificate_requests")
        .select("status, rejection_reason")
        .eq("user_id", student.user_id)
        .maybeSingle();
      setCertRequest(cert as typeof certRequest);
    };
    load();
  }, [open, student]);

  const pct =
    progress.length > 0
      ? Math.round((progress.filter((p) => p.done).length / progress.length) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Aluno</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-lg bg-secondary p-4">
            <h3 className="text-sm font-semibold text-primary">Dados Pessoais</h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Nome</dt>
                <dd className="font-medium">{profile?.full_name || "(sem nome)"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{profile?.email || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="font-medium">{profile?.whatsapp_number || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Registo</dt>
                <dd className="font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("pt-PT")
                    : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Inscrição</dt>
                <dd className="font-medium">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${student.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {student.status === "active" ? "Ativo" : "Pendente"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <h3 className="text-sm font-semibold text-primary">Progresso nas Aulas</h3>
            <p className="mt-1 text-2xl font-bold">{pct}%</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <ul className="mt-3 space-y-1">
              {progress.map((p) => (
                <li key={p.lesson_id} className="flex items-center gap-2 text-sm">
                  {p.done ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground" />
                  )}
                  {p.title}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <h3 className="text-sm font-semibold text-primary">Tentativas de Quiz</h3>
            {quizAttempts.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">Nenhuma tentativa.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {quizAttempts.map((q, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>
                      {q.score}/{q.total} — {q.passed ? "Aprovado" : "Não aprovado"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(q.created_at).toLocaleDateString("pt-PT")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <h3 className="text-sm font-semibold text-primary">Comentários</h3>
            <p className="mt-1 text-sm">
              {comments} comentário{comments === 1 ? "" : "s"} feitos
            </p>
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <h3 className="text-sm font-semibold text-primary">Certificado</h3>
            {!certRequest ? (
              <p className="mt-1 text-sm text-muted-foreground">Nenhum pedido.</p>
            ) : (
              <p className="mt-1 text-sm">
                {certRequest.status === "pending" && "Pedido pendente"}
                {certRequest.status === "approved" && (
                  <span className="text-green-600">Aprovado</span>
                )}
                {certRequest.status === "rejected" && (
                  <span>
                    <span className="text-red-600">Rejeitado</span>
                    {certRequest.rejection_reason && (
                      <span className="ml-2 text-muted-foreground">
                        — {certRequest.rejection_reason}
                      </span>
                    )}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
