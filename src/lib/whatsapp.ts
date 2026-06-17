const EVOGO_API_URL = "https://api.evo-go.com/message/send";

type WhatsAppConfig = {
  instanceId: string;
  token: string;
};

function getConfig(): WhatsAppConfig | null {
  const instanceId = import.meta.env.VITE_EVOGO_INSTANCE_ID || process.env.EVOGO_INSTANCE_ID;
  const token = import.meta.env.VITE_EVOGO_TOKEN || process.env.EVOGO_TOKEN;
  if (!instanceId || !token) return null;
  return { instanceId, token };
}

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const config = getConfig();
  if (!config) {
    console.warn("[WhatsApp] Evo Go not configured. Set EVOGO_INSTANCE_ID and EVOGO_TOKEN.");
    return false;
  }

  const formatted = phone.startsWith("+") ? phone.substring(1) : phone;

  try {
    const res = await fetch(`${EVOGO_API_URL}/${config.instanceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        number: formatted,
        text: message,
      }),
    });
    if (!res.ok) {
      console.error("[WhatsApp] Failed to send:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[WhatsApp] Error:", err);
    return false;
  }
}

export function enrollmentActivatedMessage(name: string): string {
  return `Olá ${name}, o teu acesso ao curso *Costura do Zero ao Profissional* foi ativado! 🎉

Já podes começar a assistir às aulas em: https://ondjangocapital.com/curso

Bons estudos! 💪`;
}

export function certificateApprovedMessage(name: string): string {
  return `Olá ${name}, o teu certificado do curso *Costura do Zero ao Profissional* foi aprovado e já está disponível! 🎉

Parabéns pela conclusão! 🏆`;
}
