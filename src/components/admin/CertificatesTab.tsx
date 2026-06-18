import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { certificateApprovedMessage } from "@/lib/whatsapp";
import { approveCertificate } from "@/lib/api/certificate.functions";
import { sendWhatsAppMessage } from "@/lib/api/whatsapp.functions";
import { rejectCertificate } from "@/lib/api/admin.functions";
import type { CertificateRequest } from "./types";

export function CertificatesTab() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [rejectionText, setRejectionText] = useState<Record<string, string>>({});
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

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
    setApprovingId(r.id);
    try {
      await approveCertificate({ requestId: r.id });

      toast.success("Certificado aprovado");
      if (r.profile?.full_name) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("whatsapp_number")
          .eq("id", r.user_id)
          .single();
        if (prof?.whatsapp_number) {
          sendWhatsAppMessage({
            phone: prof.whatsapp_number,
            message: certificateApprovedMessage(r.profile.full_name),
          });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar certificado");
      console.error("Erro ao aprovar certificado:", err);
    } finally {
      setApprovingId(null);
      load();
    }
  };

  const reject = async (r: CertificateRequest) => {
    setRejectingId(r.id);
    try {
      const reason = rejectionText[r.id]?.trim();
      if (!reason) {
        toast.error("Indica o motivo da rejeição.");
        return;
      }
      await rejectCertificate({ requestId: r.id, reason });
      toast.success("Certificado rejeitado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao rejeitar certificado");
      console.error("Erro ao rejeitar certificado:", err);
    } finally {
      setRejectingId(null);
      load();
    }
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
                    disabled={approvingId === r.id}
                    className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {approvingId === r.id ? (
                      <>A aprovar...</>
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-4 w-4" /> Aprovar
                      </>
                    )}
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
                    disabled={rejectingId === r.id}
                    className="text-red-600 disabled:opacity-50"
                  >
                    {rejectingId === r.id ? (
                      <>A rejeitar...</>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-4 w-4" /> Rejeitar
                      </>
                    )}
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
