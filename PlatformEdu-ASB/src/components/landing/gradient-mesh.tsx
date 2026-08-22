"use client";

import { useEffect, useRef } from "react";

export function GradientMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    const orbs = [
      { x: 0.3, y: 0.2, r: 200, color: "rgba(99, 102, 241, 0.12)", speed: 0.0003, phase: 0 },
      { x: 0.7, y: 0.3, r: 160, color: "rgba(245, 158, 11, 0.08)", speed: 0.0004, phase: 2 },
      { x: 0.5, y: 0.6, r: 240, color: "rgba(99, 102, 241, 0.06)", speed: 0.0002, phase: 4 },
      { x: 0.2, y: 0.7, r: 120, color: "rgba(6, 182, 212, 0.06)", speed: 0.0005, phase: 1 },
    ];

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      for (const orb of orbs) {
        const cx = (orb.x + Math.sin(time * orb.speed + orb.phase) * 0.08) * w;
        const cy = (orb.y + Math.cos(time * orb.speed * 0.7 + orb.phase) * 0.06) * h;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      time++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
