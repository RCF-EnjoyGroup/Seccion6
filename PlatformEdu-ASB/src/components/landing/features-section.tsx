import { Play, Brain, Zap, Shield, Users, Award } from "lucide-react";

const FEATURES = [
  {
    icon: Play,
    title: "Reproductor de última generación",
    description:
      "Video HD con progreso guardado, marcadores y velocidad ajustable. Continúa donde lo dejaste desde cualquier dispositivo.",
  },
  {
    icon: Brain,
    title: "Quizzes interactivos",
    description:
      "Evalúa tu comprensión con preguntas de opción múltiple integradas en cada lección. Aprende reforzando conceptos clave.",
  },
  {
    icon: Zap,
    title: "Inscripción instantánea",
    description:
      "Inscríbete en cursos gratuitos con un clic. Los cursos de pago tienen checkout seguro con Stripe.",
  },
  {
    icon: Shield,
    title: "Contenido verificado",
    description:
      "Todos los cursos pasan por revisión de calidad. Instructores expertos con experiencia real en la industria.",
  },
  {
    icon: Users,
    title: "Comunidad de aprendizaje",
    description:
      "Conecta con otros estudiantes, comparte avances y recibe retroalimentación de instructores y compañeros.",
  },
  {
    icon: Award,
    title: "Certificaciones automáticas",
    description:
      "Obtén tu certificado verificado al completar un curso. Comparte tu logro en LinkedIn y tu portafolio.",
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="text-center mb-14">
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
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
