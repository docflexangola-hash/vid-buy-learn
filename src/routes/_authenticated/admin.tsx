import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  FileText,
  Upload,
  BookOpen,
  CheckCircle,
  XCircle,
  ExternalLink,
  LayoutDashboard,
  Users,
  Shield,
  Activity,
  TrendingUp,
  GraduationCap,
  DollarSign,
  UserCheck,
  Clock,
  MessageSquare,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  sendWhatsApp,
  enrollmentActivatedMessage,
  certificateApprovedMessage,
} from "@/lib/whatsapp";
import { COURSE } from "@/lib/course";
import { BlogAdminTab } from "@/components/BlogAdminTab";
import { approveCertificate } from "@/lib/api/certificate.functions";
import { getSiteConfig, updateSiteConfig, type SiteConfigData } from "@/lib/api/config.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Ondjango Capital" }] }),
  component: AdminPage,
});

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  position: number;
};
type Student = {
  id: string;
  status: "pending" | "active";
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null; email: string | null } | null;
};
type Material = {
  id: string;
  lesson_id: string;
  title: string;
  file_type: string;
  file_url: string;
  created_at: string;
};
type QuizQuestion = {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_index: number;
  position: number;
};
type CertificateRequest = {
  id: string;
  user_id: string;
  status: string;
  rejection_reason: string | null;
  certificate_url: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
  profile?: { full_name: string | null; email: string | null } | null;
};
type ActivityItem = {
  id: string;
  type: "enrollment" | "certificate" | "comment";
  description: string;
  user_name: string;
  created_at: string;
};
type DashboardMetrics = {
  totalStudents: number;
  activeStudents: number;
  pendingStudents: number;
  estimatedRevenue: number;
  pendingCertificates: number;
};
type EnrollmentByDay = {
  date: string;
  count: number;
};
type LessonProgressStat = {
  lesson_title: string;
  completed: number;
  total: number;
  pct: number;
};

function AdminPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadLessons = async () => {
    const { data } = await supabase.from("lessons").select("*").order("position");
    setLessons((data ?? []) as Lesson[]);
  };
  const loadStudents = async () => {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, status, created_at, user_id")
      .order("created_at", { ascending: false });
    const list = (enr ?? []) as Student[];
    const ids = list.map((s) => s.user_id);
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      list.forEach((s) => {
        const p = map.get(s.user_id);
        s.profile = p ? { full_name: p.full_name, email: p.email } : null;
      });
    }
    setStudents(list);
  };

  useEffect(() => {
    const check = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return navigate({ to: "/auth" });
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      const ok = !!roles?.some((r) => r.role === "admin");
      setAllowed(ok);
      if (ok) {
        setCurrentUserId(u.user.id);
        await loadLessons();
        await loadStudents();
      }
    };
    check();
  }, [navigate]);

  if (allowed === null) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-10 text-center text-muted-foreground">A carregar...</div>
      </div>
    );
  }
  if (!allowed) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-10 text-center text-muted-foreground">
          Acesso restrito a administradores.
        </div>
      </div>
    );
  }

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = lessons.length ? Math.max(...lessons.map((l) => l.position)) + 1 : 1;
    const { error } = await supabase.from("lessons").insert({
      title,
      description: desc,
      video_url: url,
      position: next,
    });
    if (error) return toast.error(error.message);
    toast.success("Aula adicionada");
    setTitle("");
    setDesc("");
    setUrl("");
    loadLessons();
  };

  const move = async (l: Lesson, dir: -1 | 1) => {
    const idx = lessons.findIndex((x) => x.id === l.id);
    const swap = lessons[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("lessons").update({ position: swap.position }).eq("id", l.id),
      supabase.from("lessons").update({ position: l.position }).eq("id", swap.id),
    ]);
    loadLessons();
  };

  const removeLesson = async (l: Lesson) => {
    if (!confirm(`Apagar aula "${l.title}"?`)) return;
    const { error } = await supabase.from("lessons").delete().eq("id", l.id);
    if (error) return toast.error(error.message);
    loadLessons();
  };

  const setStatus = async (s: Student, newStatus: "pending" | "active") => {
    const { error } = await supabase
      .from("enrollments")
      .update({ status: newStatus })
      .eq("id", s.id);
    if (error) {
      toast.error(error.message);
      return loadStudents();
    }
    toast.success(newStatus === "active" ? "Acesso liberado" : "Acesso revogado");
    if (newStatus === "active" && s.profile?.full_name) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("whatsapp_number")
        .eq("id", s.user_id)
        .single();
      if (prof?.whatsapp_number) {
        sendWhatsApp(prof.whatsapp_number, enrollmentActivatedMessage(s.profile.full_name));
      }
    }
    loadStudents();
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">Painel admin</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <div className="overflow-x-auto">
            <TabsList className="flex-nowrap">
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="lessons">Aulas ({lessons.length})</TabsTrigger>
              <TabsTrigger value="students">Alunos ({students.length})</TabsTrigger>
              <TabsTrigger value="certificates">Certificados</TabsTrigger>
              <TabsTrigger value="admins">
                <Shield className="mr-1.5 h-4 w-4" />
                Admins
              </TabsTrigger>
              <TabsTrigger value="blog">
                <FileText className="mr-1.5 h-4 w-4" />
                Blog
              </TabsTrigger>
              <TabsTrigger value="payments">
                <DollarSign className="mr-1.5 h-4 w-4" />
                Pagamentos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="lessons" className="space-y-6 pt-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary">Adicionar nova aula</h2>
              <form onSubmit={addLesson} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>URL do vídeo (YouTube)</Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary">Aulas</h2>
              {lessons.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Nenhuma aula ainda.</p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {lessons.map((l, i) => (
                    <li key={l.id} className="flex items-center gap-3 py-3">
                      <span className="w-6 shrink-0 text-sm text-muted-foreground">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{l.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{l.video_url}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 overflow-x-auto">
                        <MaterialsDialog lesson={l} />
                        <QuizzesDialog lesson={l} />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => move(l, -1)}
                          disabled={i === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => move(l, 1)}
                          disabled={i === lessons.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => removeLesson(l)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="students" className="pt-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary">Alunos & inscrições</h2>
              <Input
                placeholder="Pesquisar aluno por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              {students.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Ainda não há pedidos de inscrição.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {students
                    .filter((s) => {
                      const name = (s.profile?.full_name ?? "").toLowerCase();
                      const email = (s.profile?.email ?? "").toLowerCase();
                      const q = searchQuery.toLowerCase();
                      return name.includes(q) || email.includes(q);
                    })
                    .map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-col gap-3 py-3 md:flex-row md:items-center"
                      >
                        <div className="flex-1">
                          <button
                            onClick={() => setProfileStudent(s)}
                            className="font-medium text-left hover:text-gold hover:underline"
                          >
                            {s.profile?.full_name || "(sem nome)"}
                          </button>
                          <p className="text-xs text-muted-foreground">{s.profile?.email}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${s.status === "active" ? "bg-gold text-gold-foreground" : "bg-secondary text-secondary-foreground"}`}
                        >
                          {s.status === "active" ? "Ativo" : "Pendente"}
                        </span>
                        {s.status === "pending" ? (
                          <Button
                            size="sm"
                            onClick={() => setStatus(s, "active")}
                            className="bg-primary text-primary-foreground"
                          >
                            Liberar acesso
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStatus(s, "pending")}
                          >
                            Revogar
                          </Button>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="pt-4">
            <CertificatesTab />
          </TabsContent>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="admins">
            <AdminsTab />
          </TabsContent>
          <TabsContent value="blog">
            <BlogAdminTab currentUserId={currentUserId} />
          </TabsContent>
          <TabsContent value="payments" className="pt-4">
            <PaymentsTab />
          </TabsContent>
        </Tabs>

        <StudentProfileDialog
          student={profileStudent}
          open={!!profileStudent}
          onOpenChange={(v) => {
            if (!v) setProfileStudent(null);
          }}
        />
      </div>
    </div>
  );
}

function MaterialsDialog({ lesson }: { lesson: Lesson }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("lesson_materials")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("created_at");
    setMaterials((data ?? []) as Material[]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileType = file.type.startsWith("image/") ? "image" : "pdf";
    const path = `${lesson.id}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("lesson-materials").upload(path, file);
    if (uploadErr) {
      toast.error(uploadErr.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("lesson-materials").getPublicUrl(path);
    const { error } = await supabase.from("lesson_materials").insert({
      lesson_id: lesson.id,
      title: file.name,
      file_type: fileType,
      file_url: urlData.publicUrl,
    });
    if (error) toast.error(error.message);
    else toast.success("Material adicionado");
    setUploading(false);
    load();
  };

  const remove = async (m: Material) => {
    const { error } = await supabase.from("lesson_materials").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success("Material removido");
    load();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) load();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <FileText className="mr-1 h-4 w-4" /> Materiais
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Materiais — {lesson.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label
            htmlFor="file-upload"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground hover:border-primary"
          >
            <Upload className="h-5 w-5" />
            {uploading ? "A carregar..." : "Clique para fazer upload (PDF ou imagem)"}
          </Label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum material ainda.</p>
          ) : (
            <ul className="space-y-2">
              {materials.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate hover:underline"
                  >
                    {m.title}
                  </a>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(m)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuizzesDialog({ lesson }: { lesson: Lesson }) {
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const load = async () => {
    const { data } = await supabase
      .from("lesson_quizzes")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("position");
    setQuizzes((data ?? []) as QuizQuestion[]);
  };

  const add = async () => {
    if (!question.trim() || options.some((o) => !o.trim()))
      return toast.error("Preenche a pergunta e todas as opções.");
    const next = quizzes.length ? Math.max(...quizzes.map((q) => q.position)) + 1 : 1;
    const { error } = await supabase.from("lesson_quizzes").insert({
      lesson_id: lesson.id,
      question: question.trim(),
      options,
      correct_index: correctIndex,
      position: next,
    });
    if (error) return toast.error(error.message);
    toast.success("Pergunta adicionada");
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    load();
  };

  const remove = async (q: QuizQuestion) => {
    const { error } = await supabase.from("lesson_quizzes").delete().eq("id", q.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) load();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <BookOpen className="mr-1 h-4 w-4" /> Quizzes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quizzes — {lesson.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Nova pergunta</h3>
            <div className="space-y-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pergunta..."
              />
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    className="shrink-0"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const n = [...options];
                      n[i] = e.target.value;
                      setOptions(n);
                    }}
                    placeholder={`Opção ${i + 1}`}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Seleciona o rádio ao lado da opção correta.
              </p>
            </div>
            <Button size="sm" onClick={add} className="mt-2">
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>
          {quizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma pergunta ainda.</p>
          ) : (
            <ul className="space-y-2">
              {quizzes.map((q) => (
                <li key={q.id} className="rounded-lg bg-secondary p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{q.question}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 shrink-0"
                      onClick={() => remove(q)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {(q.options as string[]).map((opt, i) => (
                      <li
                        key={i}
                        className={i === q.correct_index ? "font-medium text-green-600" : ""}
                      >
                        {i === q.correct_index ? "✓ " : ""}
                        {opt}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CertificatesTab() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [rejectionText, setRejectionText] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase
      .from("certificate_requests")
      .select("*")
      .order("requested_at", { ascending: false });
    const list = (data ?? []) as CertificateRequest[];
    const ids = list.map((r) => r.user_id);
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      list.forEach((r) => {
        const p = map.get(r.user_id);
        r.profile = p ? { full_name: p.full_name, email: p.email } : null;
      });
    }
    setRequests(list);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (r: CertificateRequest) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return toast.error("Não autenticado");

    const result = await approveCertificate({
      requestId: r.id,
      reviewerId: userData.user.id,
      reviewerName: userData.user.email ?? "Admin",
    });

    if (result.error) return toast.error(result.error.message || "Erro ao gerar certificado");
    toast.success("Certificado aprovado");
    if (r.profile?.full_name) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("whatsapp_number")
        .eq("id", r.user_id)
        .single();
      if (prof?.whatsapp_number) {
        sendWhatsApp(prof.whatsapp_number, certificateApprovedMessage(r.profile.full_name));
      }
    }
    load();
  };

  const reject = async (r: CertificateRequest) => {
    const reason = rejectionText[r.id]?.trim();
    if (!reason) return toast.error("Indica o motivo da rejeição.");
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("certificate_requests")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
        reviewer_id: userData.user?.id,
      })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Certificado rejeitado");
    load();
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-primary">Pedidos de certificado</h2>
      {requests.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhum pedido ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {requests.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <p className="font-medium">{r.profile?.full_name || "(sem nome)"}</p>
                  <p className="text-xs text-muted-foreground">{r.profile?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Pedido: {new Date(r.requested_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    r.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gold text-gold-foreground"
                  }`}
                >
                  {r.status === "approved"
                    ? "Aprovado"
                    : r.status === "rejected"
                      ? "Rejeitado"
                      : "Pendente"}
                </span>
              </div>
              {r.status === "pending" && (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => approve(r)}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" /> Aprovar
                  </Button>
                  <Input
                    placeholder="Motivo da rejeição..."
                    className="h-8 w-full sm:max-w-xs text-xs"
                    value={rejectionText[r.id] || ""}
                    onChange={(e) => setRejectionText({ ...rejectionText, [r.id]: e.target.value })}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reject(r)}
                    className="text-red-600"
                  >
                    <XCircle className="mr-1 h-4 w-4" /> Rejeitar
                  </Button>
                </div>
              )}
              {r.status === "rejected" && r.rejection_reason && (
                <p className="mt-2 text-sm text-red-600">Motivo: {r.rejection_reason}</p>
              )}
              {r.status === "approved" && (
                <p className="mt-2 text-sm text-green-600">Certificado aprovado.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DashboardTab() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [enrollmentsByDay, setEnrollmentsByDay] = useState<EnrollmentByDay[]>([]);
  const [lessonStats, setLessonStats] = useState<LessonProgressStat[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const load = async () => {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, status, user_id, created_at");
    const list = (enr ?? []) as Student[];
    const active = list.filter((s) => s.status === "active");
    const pending = list.filter((s) => s.status === "pending");

    const { count: certPending } = await supabase
      .from("certificate_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setMetrics({
      totalStudents: list.length,
      activeStudents: active.length,
      pendingStudents: pending.length,
      estimatedRevenue: active.length * COURSE.priceNumber,
      pendingCertificates: certPending ?? 0,
    });

    const dayMap = new Map<string, number>();
    list.forEach((s) => {
      const d = s.created_at.slice(0, 10);
      dayMap.set(d, (dayMap.get(d) || 0) + 1);
    });
    const sorted = [...dayMap.entries()].sort(([a], [b]) => a.localeCompare(b));
    setEnrollmentsByDay(sorted.map(([date, count]) => ({ date, count })));

    const { data: lessons } = await supabase.from("lessons").select("id, title").order("position");
    const lessonList = (lessons ?? []) as { id: string; title: string }[];
    const stats: LessonProgressStat[] = [];
    for (const l of lessonList) {
      const { count } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("lesson_id", l.id);
      stats.push({
        lesson_title: l.title,
        completed: count ?? 0,
        total: active.length,
        pct: active.length > 0 ? Math.round(((count ?? 0) / active.length) * 100) : 0,
      });
    }
    setLessonStats(stats);

    const items: ActivityItem[] = [];
    const { data: enr2 } = await supabase
      .from("enrollments")
      .select("id, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    const enrollIds = [...new Set((enr2 ?? []).map((e) => e.user_id))];
    if (enrollIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", enrollIds);
      const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
      (enr2 ?? []).forEach((e) => {
        items.push({
          id: `enr-${e.id}`,
          type: "enrollment",
          description: "Novo pedido de inscrição",
          user_name: profMap.get(e.user_id) || "(sem nome)",
          created_at: e.created_at,
        });
      });
    }

    const { data: certs } = await supabase
      .from("certificate_requests")
      .select("id, user_id, status, requested_at")
      .order("requested_at", { ascending: false })
      .limit(5);
    const certIds = [...new Set((certs ?? []).map((c) => c.user_id))];
    if (certIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", certIds);
      const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
      (certs ?? []).forEach((c) => {
        items.push({
          id: `cert-${c.id}`,
          type: "certificate",
          description: `Pedido de certificado ${c.status === "pending" ? "pendente" : c.status === "approved" ? "aprovado" : "rejeitado"}`,
          user_name: profMap.get(c.user_id) || "(sem nome)",
          created_at: c.requested_at,
        });
      });
    }

    const { data: comms } = await supabase
      .from("lesson_comments")
      .select("id, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    const commIds = [...new Set((comms ?? []).map((c) => c.user_id))];
    if (commIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", commIds);
      const profMap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
      (comms ?? []).forEach((c) => {
        items.push({
          id: `comm-${c.id}`,
          type: "comment",
          description: "Novo comentário numa aula",
          user_name: profMap.get(c.user_id) || "(sem nome)",
          created_at: c.created_at,
        });
      });
    }

    items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    setActivity(items.slice(0, 10));
  };

  useEffect(() => {
    load();
  }, []);

  if (!metrics) {
    return <p className="py-8 text-center text-muted-foreground">A carregar dashboard...</p>;
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-gold" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Alunos
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-primary">{metrics.totalStudents}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-green-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ativos
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">{metrics.activeStudents}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pendentes
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-600">{metrics.pendingStudents}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-gold" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Receita Estimada
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-primary">
            {metrics.estimatedRevenue.toLocaleString("pt-PT")} Kz
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <TrendingUp className="h-4 w-4" /> Matrículas
          </h3>
          {enrollmentsByDay.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Sem dados suficientes.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200} className="mt-4">
              <AreaChart data={enrollmentsByDay}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#C9A84C"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
            <GraduationCap className="h-4 w-4" /> Progresso por Aula
          </h3>
          {lessonStats.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200} className="mt-4">
              <BarChart data={lessonStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  dataKey="lesson_title"
                  type="category"
                  width={120}
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="pct" fill="#C9A84C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Activity className="h-4 w-4" /> Atividade Recente
        </h3>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3 text-sm">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    a.type === "enrollment"
                      ? "bg-blue-100 text-blue-700"
                      : a.type === "certificate"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {a.type === "enrollment" ? (
                    <Users className="h-3.5 w-3.5" />
                  ) : a.type === "certificate" ? (
                    <GraduationCap className="h-3.5 w-3.5" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="flex-1">
                  <span className="font-medium">{a.user_name}</span>
                  {" — "}
                  {a.description}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Inscrição
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" /> Certificado
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Comentário
          </span>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Shield className="h-4 w-4" /> Certificados Pendentes
        </h3>
        <p className="mt-2 text-2xl font-bold text-amber-600">{metrics.pendingCertificates}</p>
      </Card>
    </div>
  );
}

function PaymentsTab() {
  const [config, setConfig] = useState<SiteConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    payment_bank: "",
    payment_iban: "",
    payment_holder: "",
    payment_whatsapp: "",
    payment_note: "",
    price_label: "",
    price_number: 0,
    currency: "",
  });

  const load = async () => {
    setLoading(true);
    const data = await getSiteConfig();
    if (data) {
      setConfig(data);
      setForm({
        payment_bank: data.payment_bank,
        payment_iban: data.payment_iban,
        payment_holder: data.payment_holder,
        payment_whatsapp: data.payment_whatsapp,
        payment_note: data.payment_note,
        price_label: data.price_label,
        price_number: data.price_number,
        currency: data.currency,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.price_number || form.price_number <= 0) {
      return toast.error("O valor do preço deve ser positivo");
    }
    setSaving(true);
    try {
      await updateSiteConfig({
        data: {
          payment_bank: form.payment_bank,
          payment_iban: form.payment_iban,
          payment_holder: form.payment_holder,
          payment_whatsapp: form.payment_whatsapp,
          payment_note: form.payment_note,
          price_label: form.price_label,
          price_number: form.price_number,
          currency: form.currency,
        },
      });
      toast.success("Configurações de pagamento salvas!");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">A carregar...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-primary">Configurações de Pagamento</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Estas informações aparecem na página inicial e na área do aluno.
      </p>
      <form onSubmit={save} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Banco</Label>
            <Input
              value={form.payment_bank}
              onChange={(e) => setForm({ ...form, payment_bank: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>IBAN</Label>
            <Input
              value={form.payment_iban}
              onChange={(e) => setForm({ ...form, payment_iban: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Titular da conta</Label>
            <Input
              value={form.payment_holder}
              onChange={(e) => setForm({ ...form, payment_holder: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Número WhatsApp</Label>
            <Input
              value={form.payment_whatsapp}
              onChange={(e) => setForm({ ...form, payment_whatsapp: e.target.value })}
              placeholder="+244 900 000 000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Preço (label)</Label>
            <Input
              value={form.price_label}
              onChange={(e) => setForm({ ...form, price_label: e.target.value })}
              placeholder="15.000 Kz"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Preço (valor numérico)</Label>
            <Input
              type="number"
              value={form.price_number}
              onChange={(e) => setForm({ ...form, price_number: Number(e.target.value) })}
              min={1}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Moeda</Label>
            <Input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              placeholder="Kz"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Nota de pagamento (instruções)</Label>
          <Textarea
            value={form.payment_note}
            onChange={(e) => setForm({ ...form, payment_note: e.target.value })}
            rows={3}
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground">
            {saving ? "A salvar..." : "Salvar alterações"}
          </Button>
          {config && (
            <p className="text-xs text-muted-foreground">
              As alterações refletem imediatamente no site.
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}

function StudentProfileDialog({
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

function AdminsTab() {
  const [admins, setAdmins] = useState<
    { user_id: string; full_name: string | null; email: string | null }[]
  >([]);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    setCurrentUserId(u.user?.id ?? null);

    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    if (!roles) return;
    const ids = roles.map((r) => r.user_id);
    if (ids.length === 0) return;
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ids);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    setAdmins(
      ids.map((id) => {
        const p = map.get(id);
        return { user_id: id, full_name: p?.full_name ?? null, email: p?.email ?? null };
      }),
    );
  };

  useEffect(() => {
    load();
  }, []);

  const addAdmin = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    const { data: profs } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", newEmail.trim())
      .maybeSingle();
    if (!profs) {
      toast.error("Utilizador não encontrado com esse email.");
      setAdding(false);
      return;
    }
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: profs.id, role: "admin" });
    if (error) {
      if (error.code === "23505") toast.error("Este utilizador já é admin.");
      else toast.error(error.message);
      setAdding(false);
      return;
    }
    toast.success("Admin adicionado!");
    setNewEmail("");
    setAdding(false);
    load();
  };

  const removeAdmin = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error("Não podes remover a ti próprio.");
      return;
    }
    if (!confirm("Remover este admin?")) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    if (error) return toast.error(error.message);
    toast.success("Admin removido.");
    load();
  };

  return (
    <div className="space-y-6 pt-4">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary">Adicionar Admin</h2>
        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label>Email do utilizador</Label>
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
          <Button onClick={addAdmin} disabled={adding || !newEmail.trim()}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-primary">Administradores ({admins.length})</h2>
        {admins.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum admin encontrado.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {admins.map((a) => (
              <li key={a.user_id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{a.full_name || "(sem nome)"}</p>
                  <p className="text-xs text-muted-foreground">{a.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeAdmin(a.user_id)}
                  disabled={a.user_id === currentUserId}
                  className="text-red-600"
                >
                  <XCircle className="mr-1 h-4 w-4" /> Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
