"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Masonry from "@/components/ui/masonry";

export interface BDImage {
  src: string;
  title?: string;
  alt?: string;
}

interface BedethequeGalleryProps {
  images: BDImage[];
}

export function BedethequeGallery({ images }: BedethequeGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<BDImage | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => new Set(prev).add(src));
  };

  const handleImageClick = (image: BDImage) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
    if (e.key === "ArrowRight" && selectedImage) {
      const currentIndex = images.findIndex((img) => img.src === selectedImage.src);
      const nextIndex = (currentIndex + 1) % images.length;
      setSelectedImage(images[nextIndex]);
    }
    if (e.key === "ArrowLeft" && selectedImage) {
      const currentIndex = images.findIndex((img) => img.src === selectedImage.src);
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      setSelectedImage(images[prevIndex]);
    }
  };

  // Map BDImage[] to Masonry's expected Item[]
  const masonryItems = images.map((img, i) => ({
    id: img.src,
    img: img.src,
    url: img.src, // No external link, just open lightbox
    height: 600 // fallback, Masonry will recalc
  }));

  // Custom Masonry cell renderer to support lightbox and contained images
  const renderMasonryItem = (item: any) => {
    const image = images.find((img) => img.src === item.img);
    return (
      <div
        key={item.id}
        className={cn(
          "relative rounded-lg overflow-hidden cursor-pointer group",
          "bg-muted transition-all duration-300"
        )}
        style={{ width: '100%', height: '100%' }}
        onClick={() => handleImageClick(image!)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleImageClick(image!)}
      >
        {/* Placeholder skeleton */}
        {!loadedImages.has(item.img) && (
          <div className="absolute inset-0 bg-linear-to-br from-muted to-muted-foreground/10 animate-pulse" />
        )}
        <Image
          src={item.img}
          alt={image?.alt || image?.title || `BD`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          className={cn(
            "object-contain transition-opacity duration-300",
            loadedImages.has(item.img) ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => handleImageLoad(item.img)}
        />
        {/* Title overlay on hover */}
        {image?.title && (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-sm font-medium line-clamp-2">
              {image.title}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Masonry
        items={masonryItems}
        titre="La BDthèque de fous !"
        colorShiftOnHover={false}
        scaleOnHover={true}
        blurToFocus={false}
        animateFrom="bottom"
        duration={0.7}
        stagger={0.04}
        // @ts-ignore
        renderItem={renderMasonryItem}
      />

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title || "Image agrandie"}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={handleClose}
            aria-label="Fermer"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2"
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = images.findIndex((img) => img.src === selectedImage.src);
              const prevIndex = (currentIndex - 1 + images.length) % images.length;
              setSelectedImage(images[prevIndex]);
            }}
            aria-label="Image précédente"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2"
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = images.findIndex((img) => img.src === selectedImage.src);
              const nextIndex = (currentIndex + 1) % images.length;
              setSelectedImage(images[nextIndex]);
            }}
            aria-label="Image suivante"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image container */}
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt || selectedImage.title || "BD"}
              fill
              sizes="(max-width: 1024px) 100vw, 80vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Title */}
          {selectedImage.title && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-3 rounded-lg">
              <p className="text-white text-lg font-medium text-center">
                {selectedImage.title}
              </p>
            </div>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {images.findIndex((img) => img.src === selectedImage.src) + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
