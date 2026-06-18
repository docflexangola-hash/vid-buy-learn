import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSiteConfig, updateSiteConfig } from "@/lib/api/config.functions";
import type { SiteConfigData } from "./types";

export function PaymentsTab() {
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
