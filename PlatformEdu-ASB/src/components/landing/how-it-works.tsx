"use client";

import { UserPlus, Search, Play, Award } from "lucide-react";
import { AnimatedSection } from "./animated-section";

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Crea tu cuenta",
    description:
      "Regístrate gratis en segundos. Sin tarjeta de crédito, sin compromisos. Solo tu email y una contraseña.",
  },
  {
    icon: Search,
    step: "02",
    title: "Explora cursos",
    description:
      "Navega por categorías, lee reseñas y usa a Edy para encontrar el curso perfecto para tus objetivos.",
  },
  {
    icon: Play,
    step: "03",
    title: "Aprende a tu ritmo",
    description:
      "Video HD, quizzes interactivos y recursos descargables. Estudia cuando quieras, desde cualquier dispositivo.",
  },
  {
    icon: Award,
    step: "04",
    title: "Obtén tu certificado",
    description:
      "Completa el curso y recibe un certificado verificado. Comparte tu logro en LinkedIn y tu portafolio.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <AnimatedSection animation="fade-up" className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono font-medium text-primary tracking-wide uppercase mb-4">
          Cómo funciona
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight font-heading sm:text-4xl text-balance">
          Empieza a aprender en 4 pasos
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-balance">
          Un proceso simple y directo para que te enfoques en lo que importa: aprender.
        </p>
      </AnimatedSection>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Connecting line (desktop only) */}
        <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {STEPS.map((step, i) => (
          <AnimatedSection key={step.step} animation="fade-up" delay={i * 120}>
            <div className="relative flex flex-col items-center text-center group">
              {/* Step number + icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5 group-hover:shadow-primary/15 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  <step.icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                  {step.step}
                </span>
              </div>

              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
