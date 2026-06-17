import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type SiteConfigData = {
  payment_bank: string;
  payment_iban: string;
  payment_holder: string;
  payment_whatsapp: string;
  payment_note: string;
  price_label: string;
  price_number: number;
  currency: string;
};

export const getSiteConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteConfigData | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("site_config").select("*").limit(1).single();

    if (!data) return null;
    return {
      payment_bank: data.payment_bank,
      payment_iban: data.payment_iban,
      payment_holder: data.payment_holder,
      payment_whatsapp: data.payment_whatsapp,
      payment_note: data.payment_note,
      price_label: data.price_label,
      price_number: data.price_number,
      currency: data.currency,
    };
  },
);

export const updateSiteConfig = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      payment_bank: z.string().min(1),
      payment_iban: z.string().min(1),
      payment_holder: z.string().min(1),
      payment_whatsapp: z.string().min(1),
      payment_note: z.string().min(1),
      price_label: z.string().min(1),
      price_number: z.number().positive(),
      currency: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("site_config")
      .select("id")
      .limit(1)
      .single();

    if (!existing) {
      const { error } = await supabaseAdmin.from("site_config").insert(data);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("site_config").update(data).eq("id", existing.id);
      if (error) throw new Error(error.message);
    }

    return { success: true };
  });
