import type { SiteConfigData as Config } from "@/lib/api/config.functions";

export type { Config as SiteConfigData };

export type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  position: number;
};

export type Student = {
  id: string;
  status: "pending" | "active";
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null; email: string | null } | null;
};

export type Material = {
  id: string;
  lesson_id: string;
  title: string;
  file_type: string;
  file_url: string;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_index: number;
  position: number;
};

export type CertificateRequest = {
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

export type ActivityItem = {
  id: string;
  type: "enrollment" | "certificate" | "comment";
  description: string;
  user_name: string;
  created_at: string;
};

export type DashboardMetrics = {
  totalStudents: number;
  activeStudents: number;
  pendingStudents: number;
  estimatedRevenue: number;
  pendingCertificates: number;
};

export type EnrollmentByDay = {
  date: string;
  count: number;
};

export type LessonProgressStat = {
  lesson_title: string;
  completed: number;
  total: number;
  pct: number;
};
