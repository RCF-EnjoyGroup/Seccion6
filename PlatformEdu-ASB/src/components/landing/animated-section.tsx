"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale-in" | "blur-in";
  delay?: number;
  duration?: number;
  as?: "div" | "section" | "article";
}

export function AnimatedSection({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  as: Tag = "div",
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollReveal();

  const variants = {
    "fade-up": {
      base: "translate-y-8 opacity-0",
      visible: "translate-y-0 opacity-100",
    },
    "fade-in": {
      base: "opacity-0",
      visible: "opacity-100",
    },
    "fade-left": {
      base: "-translate-x-8 opacity-0",
      visible: "translate-x-0 opacity-100",
    },
    "fade-right": {
      base: "translate-x-8 opacity-0",
      visible: "translate-x-0 opacity-100",
    },
    "scale-in": {
      base: "scale-95 opacity-0",
      visible: "scale-100 opacity-100",
    },
    "blur-in": {
      base: "blur-sm opacity-0",
      visible: "blur-0 opacity-100",
    },
  };

  const v = variants[animation];

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-all ease-out",
        isVisible ? v.visible : v.base,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
