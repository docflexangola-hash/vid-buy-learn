import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  generateCertificatePdf,
  buildCertificateFilename,
} from "../certificate/generate-pdf.server";

export const approveCertificate = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      requestId: z.string().uuid(),
      reviewerId: z.string().uuid(),
      reviewerName: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { requestId, reviewerId, reviewerName } = data;

    const { data: req, error: reqErr } = await supabaseAdmin
      .from("certificate_requests")
      .select("user_id, status")
      .eq("id", requestId)
      .single();

    if (reqErr || !req) throw new Error("Pedido não encontrado");
    if (req.status !== "pending") throw new Error("Pedido já foi processado");

    const { data: profile, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", req.user_id)
      .single();

    if (profErr || !profile) throw new Error("Perfil do aluno não encontrado");

    const studentName = profile.full_name || "Aluno";
    const completionDate = new Date();

    const pdfBytes = await generateCertificatePdf(studentName, completionDate);

    const filename = buildCertificateFilename(studentName);

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("certificates")
      .upload(filename, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) throw new Error(`Erro ao fazer upload: ${uploadErr.message}`);

    const { data: urlData } = supabaseAdmin.storage.from("certificates").getPublicUrl(filename);

    const certificateUrl = urlData.publicUrl;

    const { error: updateErr } = await supabaseAdmin
      .from("certificate_requests")
      .update({
        status: "approved",
        certificate_url: certificateUrl,
        reviewed_at: completionDate.toISOString(),
        reviewer_id: reviewerId,
      })
      .eq("id", requestId);

    if (updateErr) throw new Error(`Erro ao atualizar pedido: ${updateErr.message}`);

    return { success: true, url: certificateUrl, studentName };
  });
