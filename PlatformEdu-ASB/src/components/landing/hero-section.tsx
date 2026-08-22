"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveSimulator } from "./live-simulator";
import { GradientMesh } from "./gradient-mesh";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function HeroSection() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal({ threshold: 0.05 });
  const { ref: simRef, isVisible: simVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="relative overflow-hidden border-b bg-background text-foreground py-20 lg:py-28">
      {/* Animated gradient mesh */}
      <GradientMesh />

      {/* Static glow layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--primary)_0%,transparent_70%)] opacity-15 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "4s" }} />
      <div className="absolute top-40 right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: "5s" }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 flex flex-col items-center text-center">
        {/* Content with scroll reveal */}
        <div
          ref={heroRef}
          className={`space-y-6 max-w-3xl transition-all duration-700 ease-out ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono font-medium text-primary tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            Plataforma de Aprendizaje con IA
          </span>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight font-heading text-balance sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
              Domina las habilidades del futuro
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              con clases interactivas
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-xl text-md sm:text-lg text-muted-foreground text-balance leading-relaxed">
            Cursos premium creados por expertos en desarrollo, diseño, IA y
            negocios. Reproductor de última generación, quizzes integrados y
            certificaciones automáticas.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex justify-center items-center gap-4 flex-wrap">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <Link href="/cursos">
                  <span className="flex items-center gap-2 group/btn">
                    Explorar Cursos
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </span>
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/signup">Enseñar en EduPlatform</Link>}
            />
          </div>
        </div>

        {/* Live Simulator with delayed reveal */}
        <div
          ref={simRef}
          className={`w-full pt-10 transition-all duration-700 ease-out delay-200 ${
            simVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <LiveSimulator />
        </div>
      </div>
    </section>
  );
}
