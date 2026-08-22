"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "¿Los cursos son realmente gratis?",
    a: "Sí, muchos cursos son completamente gratis. Los cursos de pago tienen precios muy accesibles y ofrecen contenido premium con instructores expertos de la industria.",
  },
  {
    q: "¿Cómo funciona el agente Edy?",
    a: "Edy es un asistente con inteligencia artificial que puedes hablar o escribir. Te ayuda a encontrar cursos, comparar opciones e inscribirte. Está disponible 24/7 en la plataforma.",
  },
  {
    q: "¿Obtengo un certificado al completar un curso?",
    a: "Sí. Al completar todas las lecciones y evaluar tu comprensión, recibes un certificado verificado que puedes compartir en LinkedIn y tu portafolio profesional.",
  },
  {
    q: "¿Puedo aprender desde mi celular?",
    a: "Absolutamente. La plataforma es 100% responsive. Puedes ver videos, hacer quizzes y continuar tu progreso desde cualquier dispositivo — celular, tablet o computadora.",
  },
  {
    q: "¿Cómo me inscribo en un curso?",
    a: "Solo haz clic en el botón de inscripción. Los cursos gratuitos se activan al instante. Para los cursos de pago, el checkout es seguro y rápido con Stripe.",
  },
  {
    q: "¿Puedo crear mis propios cursos?",
    a: "Sí. Crea una cuenta de instructor y accede al panel de instructor donde podrás crear cursos, subir videos, crear quizzes y gestionar a tus estudiantes.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono font-medium text-primary tracking-wide uppercase mb-4">
          FAQ
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight font-heading sm:text-4xl text-balance">
          Preguntas frecuentes
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/20"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-sm font-medium text-foreground pr-4">
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-200 ${
                open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
