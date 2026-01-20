'use client';

import { useEffect, useState } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
}

export default function BentoStickers() {
  const [imageDimensions, setImageDimensions] = useState<Map<string, ImageDimensions>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Liste des stickers (18 images)
  const stickerImages = Array.from({ length: 18 }, (_, i) => `/stickers/sticker${i}.jpg`);

  // Précharger les images pour obtenir leurs dimensions
  useEffect(() => {
    const preloadImages = async () => {
      const dimensions = new Map<string, ImageDimensions>();
      
      await Promise.all(
        stickerImages.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = () => {
                dimensions.set(src, {
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                });
                resolve();
              };
              img.onerror = () => {
                dimensions.set(src, { width: 1, height: 1 });
                resolve();
              };
              img.src = src;
            })
        )
      );

      setImageDimensions(dimensions);
      setIsLoading(false);
    };

    preloadImages();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <p className="text-muted-foreground">Chargement des stickers...</p>
      </div>
    );
  }

  return (
    <>
    <div className="w-full border-b border-b-yellow-500 mt-16 mb-8">
    <h2 className="text-6xl font-title font-medium mb-4">La rue est à nous ! Sainte Anne est à nous !</h2>
    </div>
    <div className="w-full px-4 py-8">
      <div 
        className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"
        style={{ gridAutoFlow: 'dense', gridAutoRows: '150px' }}
      >
        {stickerImages.map((image, index) => {
          const dims = imageDimensions.get(image);
          const aspectRatio = dims ? dims.width / dims.height : 1;
          
          // Déterminer la taille de la cellule en fonction du ratio d'aspect
          let colSpan = 1;
          let rowSpan = 1;
          
          if (aspectRatio > 1.5) {
            // Très paysage
            colSpan = 2;
            rowSpan = 1;
          } else if (aspectRatio > 1.2) {
            // Paysage
            colSpan = 2;
            rowSpan = 1;
          } else if (aspectRatio < 0.7) {
            // Très portrait
            colSpan = 2;
            rowSpan = 3;
          } else if (aspectRatio < 0.9) {
            // Portrait
            colSpan = 2;
            rowSpan = 2;
          } else {
            // Carré ou presque - varions les tailles
            if (index % 5 === 0) {
              colSpan = 2;
              rowSpan = 2;
            } else if (index % 3 === 0) {
              colSpan = 1;
              rowSpan = 2;
            } else {
              colSpan = 1;
              rowSpan = 1;
            }
          }
          
          return (
            <div
              key={index}
              className="relative group p-2"
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
              }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={image}
                  alt={`Sticker ${index}`}
                  className="max-w-full max-h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                  style={{ borderRadius: '1.5rem' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
