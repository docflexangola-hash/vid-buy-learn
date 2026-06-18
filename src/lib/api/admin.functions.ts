import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) {
    throw new Error("Acesso restrito: apenas administradores podem executar esta operação.");
  }
}

export const addAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (!prof) throw new Error("Utilizador não encontrado com esse email.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: prof.id, role: "admin" });
    if (error) {
      if (error.code === "23505") throw new Error("Este utilizador já é admin.");
      throw new Error(error.message);
    }
    return { success: true };
  });

export const removeAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.userId === context.userId) {
      throw new Error("Não podes remover a ti próprio.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const rejectCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      requestId: z.string().uuid(),
      reason: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("certificate_requests")
      .update({
        status: "rejected",
        rejection_reason: data.reason,
        reviewed_at: new Date().toISOString(),
        reviewer_id: context.userId,
      })
      .eq("id", data.requestId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: matErr } = await supabaseAdmin
      .from("lesson_materials")
      .delete()
      .eq("lesson_id", data.lessonId);
    if (matErr) throw new Error(matErr.message);

    const { error: quizErr } = await supabaseAdmin
      .from("lesson_quizzes")
      .delete()
      .eq("lesson_id", data.lessonId);
    if (quizErr) throw new Error(quizErr.message);

    const { error: progErr } = await supabaseAdmin
      .from("lesson_progress")
      .delete()
      .eq("lesson_id", data.lessonId);
    if (progErr) throw new Error(progErr.message);

    const { error } = await supabaseAdmin.from("lessons").delete().eq("id", data.lessonId);
    if (error) throw new Error(error.message);

    return { success: true };
  });

export const updateEnrollmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      enrollmentId: z.string().uuid(),
      status: z.enum(["pending", "active"]),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("enrollments")
      .update({ status: data.status })
      .eq("id", data.enrollmentId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
