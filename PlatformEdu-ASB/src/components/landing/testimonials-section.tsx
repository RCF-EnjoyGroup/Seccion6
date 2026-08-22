"use client";

import { Star, Quote } from "lucide-react";
import { AnimatedSection } from "./animated-section";

const TESTIMONIALS = [
  {
    name: "María García",
    role: "Desarrolladora Frontend",
    avatar: "https://i.pravatar.cc/120?img=47",
    rating: 5,
    text: "La plataforma transformó mi carrera. Los cursos de React y Next.js me dieron las habilidades que necesitaba para conseguir mi trabajo soñado.",
    course: "Desarrollo Web Full Stack",
  },
  {
    name: "Carlos Mendoza",
    role: "Ingeniero de Datos",
    avatar: "https://i.pravatar.cc/120?img=12",
    rating: 5,
    text: "El reproductor de video es increíble. Puedo pausar, marcarme lecciones y continuar desde donde dejé. El quiz integrado refuerza mucho el aprendizaje.",
    course: "Python para Data Science",
  },
  {
    name: "Laura Vargas",
    role: "Diseñadora UX/UI",
    avatar: "https://i.pravatar.cc/120?img=32",
    rating: 5,
    text: "Me encanta la variedad de cursos de diseño. Los instructores son expertos reales de la industria y el contenido está siempre actualizado.",
    course: "Diseño UI con Figma",
  },
  {
    name: "Andrés López",
    role: "Emprendedor",
    avatar: "https://i.pravatar.cc/120?img=53",
    rating: 5,
    text: "Edy, el asistente con IA, es genial. Le pregunto qué curso tomar y me da recomendaciones personalizadas. Es como tener un tutor disponible 24/7.",
    course: "Marketing Digital",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden border-y bg-gradient-to-b from-muted/50 via-background to-muted/30">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-20">
        <AnimatedSection animation="fade-up" className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono font-medium text-primary tracking-wide uppercase mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight font-heading sm:text-4xl text-balance">
            Lo que dicen nuestros estudiantes
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-balance">
            Miles de estudiantes ya confían en EduPlatform para impulsar su carrera profesional.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <AnimatedSection key={t.name} animation="fade-up" delay={i * 100}>
              <div className="group relative h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 flex flex-col overflow-hidden">
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-3 -scale-x-100" />

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Course tag */}
                  <span className="text-[11px] font-mono text-primary/70 bg-primary/5 px-2 py-0.5 rounded-md w-fit mb-4">
                    {t.course}
                  </span>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-background group-hover:ring-primary/20 transition-all"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
