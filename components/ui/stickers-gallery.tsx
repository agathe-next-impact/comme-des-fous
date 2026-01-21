import React from "react";

interface StickerItem {
  id: string;
  img: string;
  url: string;
  height: number;
}

interface StickersGalleryProps {
  images: StickerItem[];
}

export function StickersGallery({ images }: StickersGalleryProps) {
  return (
    <div
      className="masonry-gallery"
      style={{
        columnCount: 4,
        columnGap: "1.5rem",
      }}
    >
      <style>
        {`
          @media (max-width: 1024px) {
            .masonry-gallery {
              column-count: 2 !important;
            }
            .masonry-gallery img {
              height: 50% !important;
              max-height: 300px;
            }
          }
          }
        `}
      </style>
      {images.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", marginBottom: "1.5rem" }}
        >
          <img
            src={item.img}
            alt={item.id}
            style={{
              width: "100%",
              height: item.height,
              objectFit: "cover",
              borderRadius: "1rem",
              display: "block",
              breakInside: "avoid",
              transition: "height 0.3s",
            }}
          />
        </a>
      ))}
    </div>
  );
}