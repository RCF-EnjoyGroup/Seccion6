"use client";

import { useEffect, useRef, useState } from "react";
import { Users, BookOpen, Award, TrendingUp } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { icon: Users, value: 2500, suffix: "+", label: "Estudiantes activos" },
  { icon: BookOpen, value: 150, suffix: "+", label: "Cursos disponibles" },
  { icon: Award, value: 4800, suffix: "+", label: "Certificados emitidos" },
  { icon: TrendingUp, value: 98, suffix: "%", label: "Satisfacción" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("es-CR")}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="relative overflow-hidden border-y bg-gradient-to-b from-muted/50 via-background to-muted/30">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors shadow-sm">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
              {/* Subtle divider between stats on desktop */}
              {i < STATS.length - 1 && (
                <div className="hidden lg:block absolute" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
