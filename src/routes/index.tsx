import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/SiteHeader";
import { Logo } from "@/components/Logo";
import { COURSE } from "@/lib/course";
import { CheckCircle2, PlayCircle, Award, Smartphone, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${COURSE.name} — Ondjango Capital` },
      { name: "description", content: COURSE.shortDescription },
      { property: "og:title", content: COURSE.name },
      { property: "og:description", content: COURSE.shortDescription },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                <Sparkles className="h-3.5 w-3.5" /> Curso online
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-primary md:text-6xl">
                {COURSE.name}
              </h1>
              <p className="mt-5 text-lg text-muted-foreground md:text-xl">
                {COURSE.shortDescription}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="#comprar">Comprar agora — {COURSE.priceLabel}</a>
                </Button>
                <a href="#beneficios" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                  Ver o que vai aprender →
                </a>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4 text-gold" /> Certificado de conclusão incluído
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gold/10 blur-2xl" />
              <Card className="relative overflow-hidden border-border/60 bg-card p-8 shadow-xl">
                <div className="flex items-center justify-center py-4">
                  <Logo className="h-24" />
                </div>
                <div className="mt-4 rounded-xl bg-secondary p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Investimento único
                  </p>
                  <p className="mt-1 text-4xl font-extrabold text-primary">{COURSE.priceLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Acesso vitalício ao curso</p>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><PlayCircle className="h-4 w-4 text-gold" /> Aulas em vídeo</li>
                  <li className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-gold" /> Em qualquer dispositivo</li>
                  <li className="flex items-center gap-2"><Award className="h-4 w-4 text-gold" /> Certificado digital</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="border-y border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">O que vai aprender</h2>
          <p className="mt-2 text-muted-foreground">Tudo para começar do zero e chegar ao nível profissional.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COURSE.benefits.map((b) => (
              <Card key={b} className="flex gap-3 border-border/60 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <p className="text-sm font-medium text-foreground">{b}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Compra */}
      <section id="comprar" className="mx-auto max-w-3xl px-4 py-20">
        <Card className="border-border/60 p-8 md:p-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">Garantir o meu acesso</h2>
            <p className="mt-3 text-muted-foreground">
              {COURSE.longDescription}
            </p>
            <div className="my-8 inline-flex flex-col items-center rounded-2xl bg-secondary px-10 py-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preço</span>
              <span className="mt-1 text-5xl font-extrabold text-primary">{COURSE.priceLabel}</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/auth">Criar conta e comprar</Link>
              </Button>
              <p className="text-xs text-muted-foreground">Já tem conta? <Link to="/auth" className="underline">Entre aqui</Link></p>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-dashed border-border bg-background/60 p-6 text-sm">
            <p className="font-semibold text-primary">Como comprar:</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>Crie a sua conta gratuitamente.</li>
              <li>Faça o pagamento: <span className="font-medium text-foreground">{COURSE.paymentInstructions.bank}</span> — IBAN <span className="font-mono">{COURSE.paymentInstructions.iban}</span> ({COURSE.paymentInstructions.holder}).</li>
              <li>{COURSE.paymentInstructions.note}</li>
            </ol>
          </div>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="text-3xl font-bold text-primary">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="1">
            <AccordionTrigger>Preciso ter experiência prévia?</AccordionTrigger>
            <AccordionContent>Não. O curso começa do absoluto zero e leva-o passo a passo até ao nível profissional.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>Por quanto tempo tenho acesso?</AccordionTrigger>
            <AccordionContent>O acesso é vitalício. Pode assistir e rever as aulas sempre que quiser.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger>Como recebo o acesso depois do pagamento?</AccordionTrigger>
            <AccordionContent>Após confirmar o pagamento, o seu acesso é liberado manualmente em até 24h. Receberá notificação por email.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="4">
            <AccordionTrigger>Recebo certificado?</AccordionTrigger>
            <AccordionContent>Sim. Ao concluir todas as aulas recebe um certificado digital de conclusão.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="5">
            <AccordionTrigger>Posso assistir pelo telemóvel?</AccordionTrigger>
            <AccordionContent>Sim, o curso funciona em qualquer dispositivo com acesso à internet.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <Logo className="h-8" />
          <p>© {new Date().getFullYear()} Ondjango Capital. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
