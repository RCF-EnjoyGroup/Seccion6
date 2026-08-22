import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
              <GraduationCap className="size-5 text-primary" />
              EduPlatform
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma de aprendizaje en línea con cursos creados por expertos.
              Aprende a tu ritmo, desde cualquier lugar.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/cursos" className="hover:text-foreground transition-colors">
                  Explorar cursos
                </Link>
              </li>
              <li>
                <Link href="/agente-edy" className="hover:text-foreground transition-colors">
                  Agente Edy (IA)
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors">
                  Crear cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* For instructors */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Para instructores</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/signup" className="hover:text-foreground transition-colors">
                  Crear un curso
                </Link>
              </li>
              <li>
                <Link href="/instructor" className="hover:text-foreground transition-colors">
                  Panel de instructor
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Mi cuenta</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/estudiante" className="hover:text-foreground transition-colors">
                  Mi aprendizaje
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="hover:text-foreground transition-colors">
                  Mi perfil
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduPlatform. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span>Hecho con ❤️ para el aprendizaje</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
