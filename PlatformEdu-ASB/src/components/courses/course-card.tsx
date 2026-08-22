import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Users,
  Code,
  Palette,
  Brain,
  BarChart3,
  Megaphone,
  Briefcase,
  Camera,
  Music,
  BookOpen,
} from "lucide-react";
import { LevelBadge } from "@/components/courses/level-badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { CourseWithInstructor } from "@/types/database";

interface CourseCardProps {
  course: CourseWithInstructor;
  layout?: "grid" | "list";
}

// Imágenes de Unsplash específicas y representativas por categoría
const CATEGORY_STYLES: Record<
  string,
  { gradient: string; icon: React.ElementType; fallbackImage: string }
> = {
  programación: {
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    icon: Code,
    fallbackImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop",
  },
  programacion: {
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    icon: Code,
    fallbackImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop",
  },
  "desarrollo web": {
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    icon: Code,
    // Monitor con múltiples pantallas de código web
    fallbackImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop",
  },
  "web": {
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    icon: Code,
    fallbackImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop",
  },
  testing: {
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    icon: Code,
    // Pantalla con código de testing/Playwright
    fallbackImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop",
  },
  playwright: {
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    icon: Code,
    fallbackImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop",
  },
  diseño: {
    gradient: "from-pink-500 via-rose-500 to-fuchsia-600",
    icon: Palette,
    // Paleta de colores y herramientas de diseño gráfico
    fallbackImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
  },
  "inteligencia artificial": {
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    icon: Brain,
    // Neural network visualización - representativo de IA
    fallbackImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop",
  },
  ia: {
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    icon: Brain,
    fallbackImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop",
  },
  datos: {
    gradient: "from-amber-500 via-orange-500 to-red-500",
    icon: BarChart3,
    // Dashboard con gráficas de datos - muy representativo
    fallbackImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
  },
  marketing: {
    gradient: "from-fuchsia-500 via-purple-500 to-indigo-600",
    icon: Megaphone,
    // Redes sociales y analytics - representativo de marketing digital
    fallbackImage: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop",
  },
  negocios: {
    gradient: "from-slate-600 via-gray-600 to-zinc-700",
    icon: Briefcase,
    // Reunión de negocios profesional
    fallbackImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
  },
  foto: {
    gradient: "from-cyan-500 via-sky-500 to-blue-600",
    icon: Camera,
    // Cámara profesional - representativo de fotografía
    fallbackImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=450&fit=crop",
  },
  música: {
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    icon: Music,
    // Estudio de música con teclado - representativo
    fallbackImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop",
  },
  matemáticas: {
    gradient: "from-orange-500 via-red-500 to-pink-500",
    icon: BarChart3,
    // Fórmulas matemáticas - representativo
    fallbackImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop",
  },
  ciencia: {
    gradient: "from-teal-500 via-cyan-500 to-blue-500",
    icon: Brain,
    // Laboratorio de ciencias
    fallbackImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop",
  },
  inglés: {
    gradient: "from-blue-400 via-indigo-400 to-violet-500",
    icon: BookOpen,
    // Libros y aprendizaje de idiomas
    fallbackImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop",
  },
};

// Fallback por defecto para categorías no mapeadas
const DEFAULT_STYLE = {
  gradient: "from-primary/80 via-primary to-primary/60",
  icon: BookOpen,
  fallbackImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=450&fit=crop",
};

function getCategoryStyle(category: string) {
  const key = category.toLowerCase().trim();
  return CATEGORY_STYLES[key] ?? DEFAULT_STYLE;
}

export function CourseCard({ course, layout = "grid" }: CourseCardProps) {
  const isList = layout === "list";
  const catStyle = getCategoryStyle(course.category);
  const CatIcon = catStyle.icon;

  return (
    <Link
      href={`/cursos/${course.slug}`}
      className={cn(
        "group flex overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/20",
        isList ? "flex-row" : "flex-col",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          isList ? "aspect-video w-32 sm:w-56" : "aspect-video w-full",
        )}
      >
        <Image
          src={course.thumbnail_url || catStyle.fallbackImage}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={isList ? "224px" : "(max-width: 768px) 100vw, 320px"}
        />
        {/* Overlay de gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        {/* Badge de categoría */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[11px] font-medium text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <CatIcon className="w-3 h-3" />
            {course.category}
          </span>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col gap-2 p-4", isList && "justify-center")}>
        <LevelBadge level={course.level} className="w-fit" />
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {course.instructor?.full_name ?? "Instructor"}
        </p>
        <div
          className={cn(
            "flex items-center justify-between",
            isList ? "mt-1" : "mt-auto pt-2",
          )}
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {course.rating_count > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {course.rating_average.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {course.student_count}
            </span>
          </div>
          <span className="font-semibold">{formatCurrency(course.price)}</span>
        </div>
      </div>
    </Link>
  );
}
