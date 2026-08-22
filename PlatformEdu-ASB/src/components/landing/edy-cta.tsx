import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EdyCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 sm:p-12">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
              <Bot className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold tracking-tight font-heading mb-2">
              Habla con Edy, tu asistente con IA
            </h2>
            <p className="text-muted-foreground max-w-lg">
              No sabes qué curso elegir? Pregúntale a Edy. Busca cursos, compara opciones
              y regístrate con solo hablarle — o escríbele si prefieres.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button size="lg" nativeButton={false} render={<Link href="/agente-edy"><span className="flex items-center gap-2">Probar Edy <ArrowRight className="w-4 h-4" /></span></Link>} />
          </div>
        </div>
      </div>
    </section>
  );
}
