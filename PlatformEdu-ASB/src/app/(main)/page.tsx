import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/courses/course-card";
import { getCategoriesWithCounts, getFeaturedCourses } from "@/lib/queries/courses";
import { LiveSimulator } from "@/components/landing/live-simulator";
import { StatsBar } from "@/components/landing/stats-bar";
import { EdyCta } from "@/components/landing/edy-cta";
import { TrustedBy } from "@/components/landing/trusted-by";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";

export default async function HomePage() {
  const [featuredCourses, categories] = await Promise.all([
    getFeaturedCourses(8),
    getCategoriesWithCounts(),
  ]);

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Trusted By ─────────────────────────────────────── */}
      <TrustedBy />

      {/* ── Stats ──────────────────────────────────────────── */}
      <StatsBar />

      {/* ── How It Works ───────────────────────────────────── */}
      <HowItWorks />

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
                className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5"
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

      {/* ── Testimonials ────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── Edy CTA ────────────────────────────────────────── */}
      <EdyCta />

      {/* ── FAQ ────────────────────────────────────────────── */}
      <FaqSection />
    </div>
  );
}
