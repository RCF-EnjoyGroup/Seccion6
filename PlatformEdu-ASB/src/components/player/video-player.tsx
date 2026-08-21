"use client";

import { getVideoEmbedUrl } from "@/lib/utils";

interface VideoPlayerProps {
  url: string;
  lessonTitle?: string;
}

export function VideoPlayer({ url, lessonTitle = "Contenido del curso" }: VideoPlayerProps) {
  const embed = getVideoEmbedUrl(url);

  if (embed.type === "direct") {
    return (
      <video
        controls
        controlsList="nodownload"
        className="aspect-video w-full rounded-lg bg-black"
        src={embed.src}
        title={`Video de lección: ${lessonTitle}`}
        aria-label={`Reproductor de video: ${lessonTitle}`}
      />
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={embed.src}
        title={`Video de lección: ${lessonTitle}`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
