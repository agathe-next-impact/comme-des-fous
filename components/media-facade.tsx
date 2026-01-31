"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface MediaFacadeProps {
  mediaUrl: string;
  mediaType: "youtube" | "podcast";
  posterUrl: string;
  title: string;
}

export function MediaFacade({
  mediaUrl,
  mediaType,
  posterUrl,
  title,
}: MediaFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    // Ajout de l'autoplay si non présent
    const separator = mediaUrl.includes("?") ? "&" : "?";
    const autoplayParam = "autoplay=1";
    const src = mediaUrl.includes("autoplay")
      ? mediaUrl
      : `${mediaUrl}${separator}${autoplayParam}`;

    return (
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full"
        allow={
          mediaType === "youtube"
            ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            : "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        }
        allowFullScreen={mediaType === "youtube"}
        title={title}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 w-full h-full group cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPlaying(true);
      }}
      role="button"
      aria-label={`Lire ${title}`}
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover shadow-md"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
             {/* Fallback si pas d'image */}
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <div className="bg-white/90 rounded-full p-4 pl-5 shadow-lg transform group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 text-black fill-current" />
        </div>
      </div>
    </div>
  );
}
