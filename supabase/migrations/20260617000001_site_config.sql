-- Site configuration table for editable payment/site settings
-- Single-row table managed by admin via the admin panel

CREATE TABLE public.site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_bank TEXT NOT NULL DEFAULT 'Banco BAI',
  payment_iban TEXT NOT NULL DEFAULT 'AO06 0040 0000 1234 5678 9012 3',
  payment_holder TEXT NOT NULL DEFAULT 'Ondjango Capital',
  payment_whatsapp TEXT NOT NULL DEFAULT '+244 900 000 000',
  payment_note TEXT NOT NULL DEFAULT 'Após o pagamento, envie o comprovativo por WhatsApp indicando o seu email. O acesso será liberado em até 24h.',
  price_label TEXT NOT NULL DEFAULT '15.000 Kz',
  price_number NUMERIC NOT NULL DEFAULT 15000,
  currency TEXT NOT NULL DEFAULT 'Kz',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_site_config_single_row ON public.site_config ((TRUE));

GRANT SELECT ON public.site_config TO anon, authenticated;
GRANT ALL ON public.site_config TO service_role;

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read site_config" ON public.site_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can update site_config" ON public.site_config
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER site_config_updated_at BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_config (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
