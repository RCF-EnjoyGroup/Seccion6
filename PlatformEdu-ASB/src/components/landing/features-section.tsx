"use client";

import { Play, Brain, Zap, Shield, Users, Award } from "lucide-react";
import { AnimatedSection } from "./animated-section";

const FEATURES = [
  {
    icon: Play,
    title: "Reproductor de última generación",
    description:
      "Video HD con progreso guardado, marcadores y velocidad ajustable. Continúa donde lo dejaste desde cualquier dispositivo.",
    span: "sm:col-span-2 lg:col-span-2",
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "Quizzes interactivos",
    description:
      "Evalúa tu comprensión con preguntas integradas en cada lección.",
    span: "sm:col-span-1",
    gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  {
    icon: Zap,
    title: "Inscripción instantánea",
    description:
      "Inscríbete en cursos gratuitos con un clic. Checkout seguro con Stripe.",
    span: "sm:col-span-1",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Contenido verificado",
    description:
      "Todos los cursos pasan por revisión de calidad. Instructores expertos con experiencia real en la industria tecnológica.",
    span: "sm:col-span-1",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: Users,
    title: "Comunidad",
    description:
      "Conecta con otros estudiantes y comparte avances.",
    span: "sm:col-span-1",
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
  },
  {
    icon: Award,
    title: "Certificaciones automáticas",
    description:
      "Obtén tu certificado verificado al completar un curso. Comparte tu logro en LinkedIn y tu portafolio profesional.",
    span: "sm:col-span-2 lg:col-span-2",
    gradient: "from-cyan-500/10 via-sky-500/5 to-transparent",
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <AnimatedSection animation="fade-up" className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono font-medium text-primary tracking-wide uppercase mb-4">
          La plataforma
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight font-heading sm:text-4xl text-balance">
          Todo lo que necesitas para aprender
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-balance">
          Diseñada para que tu enfoque esté en aprender, no en la herramienta.
          Cada detalle está pensado para maximizar tu tiempo de estudio.
        </p>
      </AnimatedSection>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature, i) => (
          <AnimatedSection
            key={feature.title}
            animation="fade-up"
            delay={i * 80}
            className={feature.span}
          >
            <div
              className={`group relative h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 overflow-hidden`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative">
                <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
