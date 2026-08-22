import Link from "next/link";
import { Bot, Search, BookOpen, UserPlus, AlertTriangle, MessageSquare } from "lucide-react";
import EdyVoiceWidgetClient from "@/components/agent/edy-voice-widget-client";

export const metadata = {
  title: "Agente Edy - Asistente de EduPlatform",
  description: "Habla con Edy, tu asistente de voz para buscar cursos e inscribirte",
};

export default function AgenteEdyPage() {
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "wss://edutech-meo77bh3.livekit.cloud";
  const room = "edtech-widget";

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-background text-foreground py-16 lg:py-24">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--primary)_0%,transparent_70%)] opacity-15 pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-4 flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono font-medium text-primary tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Asistente de Voz con IA
          </span>

          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background" />
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight font-heading text-balance sm:text-5xl bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
              Conoce a Edy
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground text-balance leading-relaxed">
              Tu asistente de voz inteligente. Busca cursos, compara opciones e
              inscríbete con solo hablarle — o escríbele si prefieres.
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            En línea y listo para ayudarte
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold font-heading mb-3">¿Qué puede hacer Edy?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Edy está conectado al catálogo completo de cursos y puede realizar acciones por ti.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Search,
              title: "Buscar cursos",
              description: "Encuentra cursos por tema, categoría o palabra clave con búsqueda inteligente.",
            },
            {
              icon: BookOpen,
              title: "Ver detalles",
              description: "Conoce el contenido, instructor, precio y lecciones de cualquier curso.",
            },
            {
              icon: UserPlus,
              title: "Inscribirte",
              description: "Inscríbete en cursos gratuitos al instante o recibe un link de checkout.",
            },
            {
              icon: MessageSquare,
              title: "Escribir o hablar",
              description: "Usa el micrófono para conversar o escribe tus preguntas directamente.",
            },
            {
              icon: AlertTriangle,
              title: "Escalar casos",
              description: "Si tienes problemas técnicos o necesitas ayuda humana, Edy te conecta.",
            },
            {
              icon: Bot,
              title: "IA conversacional",
              description: "Respuestas naturales y concisas, como hablar con un asesor real.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples Section */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold font-heading">Prueba preguntarle</h2>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-3">
            {[
              "Quiero cursos de programación",
              "Muéstrame cursos gratis",
              "¿Qué cursos tiene diseño?",
              "Dame detalles del primer curso",
              "Inscríbeme en ese curso",
              "No puedo acceder a mis lecciones",
            ].map((example) => (
              <div
                key={example}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground"
              >
                <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                &ldquo;{example}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-foreground">Versión de demostración</p>
              <p className="text-muted-foreground">
                Los pagos están <strong className="text-foreground">simulados</strong>. Si Edy te
                ofrece un link de pago, es solo para practicar el flujo — no se cobra nada real.
                Para cursos gratuitos, inicia sesión primero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Widget */}
      <EdyVoiceWidgetClient
        livekitUrl={livekitUrl}
        room={room}
        studentId={undefined}
      />
    </div>
  );
}
