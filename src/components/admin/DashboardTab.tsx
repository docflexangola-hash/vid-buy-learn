import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
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
  Users,
  UserCheck,
  Clock,
  DollarSign,
  TrendingUp,
  GraduationCap,
  Activity,
  MessageSquare,
  Shield,
} from "lucide-react";
import { COURSE } from "@/lib/course";
import type {
  DashboardMetrics,
  EnrollmentByDay,
  LessonProgressStat,
  ActivityItem,
  Student,
} from "./types";

export function DashboardTab() {
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
