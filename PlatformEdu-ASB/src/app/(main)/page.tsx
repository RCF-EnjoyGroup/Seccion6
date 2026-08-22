import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/courses/course-card";
import { getCategoriesWithCounts, getFeaturedCourses } from "@/lib/queries/courses";
import { LiveSimulator } from "@/components/landing/live-simulator";
import { StatsBar } from "@/components/landing/stats-bar";
import { FeaturesSection } from "@/components/landing/features-section";
import { EdyCta } from "@/components/landing/edy-cta";

export default async function HomePage() {
  const [featuredCourses, categories] = await Promise.all([
    getFeaturedCourses(8),
    getCategoriesWithCounts(),
  ]);

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-background text-foreground py-20 lg:py-28">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--primary)_0%,transparent_70%)] opacity-15 pointer-events-none" />
        {/* Secondary glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 flex flex-col items-center text-center space-y-10">
          <div className="space-y-6 max-w-3xl">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono font-medium text-primary tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              Plataforma de Aprendizaje con IA
            </span>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight font-heading text-balance sm:text-6xl lg:text-7xl bg-gradient-to-b from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
              Domina las habilidades del futuro con clases interactivas
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-xl text-md sm:text-lg text-muted-foreground text-balance leading-relaxed">
              Descubre cursos premium creados por expertos en desarrollo, diseño, IA y
              negocios. Reproductor de última generación, quizzes integrados y
              certificaciones automáticas.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex justify-center items-center gap-4 flex-wrap">
              <Button size="lg" nativeButton={false} render={<Link href="/cursos"><span className="flex items-center gap-2">Explorar Cursos <ArrowRight className="w-4 h-4" /></span></Link>} />
              <Button size="lg" variant="outline" nativeButton={false} render={
                <Link href="/signup">Enseñar en EduPlatform</Link>
              } />
            </div>
          </div>

          {/* Live Simulator */}
          <div className="w-full pt-4">
            <LiveSimulator />
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <StatsBar />

      {/* ── Categories ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold font-heading">Categorías populares</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explora cursos por area de conocimiento
              </p>
            </div>
            <Link
              href="/cursos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(({ category, count }) => (
              <Link
                key={category}
                href={`/cursos?category=${encodeURIComponent(category)}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
              >
                <span className="text-foreground group-hover:text-primary transition-colors">
                  {category}
                </span>
                <Badge variant="secondary" className="text-xs font-mono">
                  {count}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Courses ────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold font-heading">Cursos destacados</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Los más populares entre nuestra comunidad de estudiantes
            </p>
          </div>
          <Link
            href="/cursos"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {featuredCourses.length === 0 ? (
          <div className="rounded-xl border border-dashed p-16 text-center">
            <p className="text-muted-foreground mb-4">
              Todavia no hay cursos publicados.
            </p>
            <Button nativeButton={false} render={<Link href="/instructor/cursos/nuevo">Crear el primer curso</Link>} />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── Edy CTA ────────────────────────────────────────── */}
      <EdyCta />
    </div>
  );
}
