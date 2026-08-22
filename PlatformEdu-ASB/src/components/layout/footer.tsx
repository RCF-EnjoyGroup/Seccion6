import Link from "next/link";
import { GraduationCap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t bg-gradient-to-b from-muted/30 to-background">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="size-4 text-primary" />
              </div>
              EduPlatform
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plataforma de aprendizaje en línea con cursos creados por expertos.
              Aprende a tu ritmo, desde cualquier lugar.
            </p>
            <div className="flex gap-3">
              {/* Social icons as simple circles */}
              {["X", "In", "YT"].map((s) => (
                <span
                  key={s}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">Plataforma</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/cursos" className="hover:text-foreground transition-colors duration-200">
                  Explorar cursos
                </Link>
              </li>
              <li>
                <Link href="/agente-edy" className="hover:text-foreground transition-colors duration-200">
                  Agente Edy (IA)
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors duration-200">
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link href="/cursos" className="hover:text-foreground transition-colors duration-200">
                  Categorías
                </Link>
              </li>
            </ul>
          </div>

          {/* For instructors */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">Para instructores</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors duration-200">
                  Crear un curso
                </Link>
              </li>
              <li>
                <Link href="/instructor" className="hover:text-foreground transition-colors duration-200">
                  Panel de instructor
                </Link>
              </li>
              <li>
                <Link href="/instructor/cursos/nuevo" className="hover:text-foreground transition-colors duration-200">
                  Nuevo curso
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">Mi cuenta</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors duration-200">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/estudiante" className="hover:text-foreground transition-colors duration-200">
                  Mi aprendizaje
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="hover:text-foreground transition-colors duration-200">
                  Mi perfil
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduPlatform. Todos los derechos reservados.</p>
          <div className="flex items-center gap-1">
            Hecho con <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> para el aprendizaje
          </div>
        </div>
      </div>
    </footer>
  );
}
