import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  FileText,
  LayoutDashboard,
  Shield,
  DollarSign,
} from "lucide-react";
import { enrollmentActivatedMessage } from "@/lib/whatsapp";
import { sendWhatsAppMessage } from "@/lib/api/whatsapp.functions";
import { deleteLesson, updateEnrollmentStatus } from "@/lib/api/admin.functions";
import { MaterialsDialog } from "@/components/admin/MaterialsDialog";
import { QuizzesDialog } from "@/components/admin/QuizzesDialog";
import type { Lesson, Student } from "@/components/admin/types";

const DashboardTab = lazy(() =>
  import("@/components/admin/DashboardTab").then((m) => ({ default: m.DashboardTab })),
);
const CertificatesTab = lazy(() =>
  import("@/components/admin/CertificatesTab").then((m) => ({ default: m.CertificatesTab })),
);
const PaymentsTab = lazy(() =>
  import("@/components/admin/PaymentsTab").then((m) => ({ default: m.PaymentsTab })),
);
const AdminsTab = lazy(() =>
  import("@/components/admin/AdminsTab").then((m) => ({ default: m.AdminsTab })),
);
const BlogAdminTab = lazy(() =>
  import("@/components/BlogAdminTab").then((m) => ({ default: m.BlogAdminTab })),
);
const StudentProfileDialog = lazy(() =>
  import("@/components/admin/StudentProfileDialog").then((m) => ({
    default: m.StudentProfileDialog,
  })),
);

const SuspenseFallback = () => (
  <p className="py-8 text-center text-muted-foreground">A carregar...</p>
);

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Ondjango Capital" }] }),
  component: AdminPage,
});

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
    try {
      await deleteLesson({ lessonId: l.id });
      loadLessons();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao apagar aula");
    }
  };

  const setStatus = async (s: Student, newStatus: "pending" | "active") => {
    try {
      await updateEnrollmentStatus({ enrollmentId: s.id, status: newStatus });
      toast.success(newStatus === "active" ? "Acesso liberado" : "Acesso revogado");
      if (newStatus === "active" && s.profile?.full_name) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("whatsapp_number")
          .eq("id", s.user_id)
          .single();
        if (prof?.whatsapp_number) {
          sendWhatsAppMessage({
            phone: prof.whatsapp_number,
            message: enrollmentActivatedMessage(s.profile.full_name),
          });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar estado");
    } finally {
      loadStudents();
    }
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
            <Suspense fallback={<SuspenseFallback />}>
              <CertificatesTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="dashboard">
            <Suspense fallback={<SuspenseFallback />}>
              <DashboardTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="admins">
            <Suspense fallback={<SuspenseFallback />}>
              <AdminsTab />
            </Suspense>
          </TabsContent>
          <TabsContent value="blog">
            <Suspense fallback={<SuspenseFallback />}>
              <BlogAdminTab currentUserId={currentUserId} />
            </Suspense>
          </TabsContent>
          <TabsContent value="payments" className="pt-4">
            <Suspense fallback={<SuspenseFallback />}>
              <PaymentsTab />
            </Suspense>
          </TabsContent>
        </Tabs>

        <Suspense fallback={null}>
          <StudentProfileDialog
            student={profileStudent}
            open={!!profileStudent}
            onOpenChange={(v) => {
              if (!v) setProfileStudent(null);
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
