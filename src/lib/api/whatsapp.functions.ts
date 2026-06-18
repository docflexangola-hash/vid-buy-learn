import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EVOGO_API_URL = "https://api.evo-go.com/message/send";

export const sendWhatsAppMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      phone: z.string().min(1),
      message: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const instanceId = process.env.EVOGO_INSTANCE_ID;
    const token = process.env.EVOGO_TOKEN;

    if (!instanceId || !token) {
      console.warn("[WhatsApp] Evo Go not configured. Set EVOGO_INSTANCE_ID and EVOGO_TOKEN.");
      return { success: false };
    }

    const formatted = data.phone.startsWith("+") ? data.phone.substring(1) : data.phone;

    try {
      const res = await fetch(`${EVOGO_API_URL}/${instanceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: formatted,
          text: data.message,
        }),
      });

      if (!res.ok) {
        console.error("[WhatsApp] Failed to send:", await res.text());
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      console.error("[WhatsApp] Error:", err);
      return { success: false };
    }
  });
