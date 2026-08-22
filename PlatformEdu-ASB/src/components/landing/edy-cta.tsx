"use client";

import Link from "next/link";
import { Bot, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./animated-section";

export function EdyCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <AnimatedSection animation="scale-in">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 sm:p-12 lg:p-16">
          {/* Ambient glows */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(var(--primary)_1px,transparent_1px),linear-gradient(90deg,var(--primary)_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.03] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center gap-10">
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10 group-hover:shadow-primary/20 transition-all">
                <Bot className="w-12 h-12 text-primary" />
              </div>
              {/* Pulse ring */}
              <div className="absolute -inset-2 rounded-3xl border border-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
              {/* Status dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-lg" />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-primary uppercase tracking-wider">Asistente con IA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mb-3">
                Habla con Edy, tu asistente personal
              </h2>
              <p className="text-muted-foreground max-w-lg text-balance">
                No sabes qué curso elegir? Pregúntale a Edy. Busca cursos, compara opciones
                y regístrate con solo hablarle — o escríbele si prefieres.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <Link href="/agente-edy">
                    <span className="flex items-center gap-2 group/btn">
                      Probar Edy
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </Link>
                }
              />
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
