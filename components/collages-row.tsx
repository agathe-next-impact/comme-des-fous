import React from "react";
import Image from "next/image";

interface CollageItem {
  id: string;
  img: string;
  url: string;
  height: number;
}

interface CollagesRowProps {
  items: CollageItem[];
  titre: string;
}

const CollagesRow: React.FC<CollagesRowProps> = ({ items, titre }) => {
  return (
    <>
    <div className="w-full border-b border-red-500 mt-16 mb-8">
      <h2 className="text-6xl font-title font-bold mb-4">{titre}</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-x-auto py-8">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
        <Image
            src={item.img}
            alt={item.id}
            width={item.height * (4/3)}
            height={item.height}
            style={{ borderRadius: 16 }}
            className="shadow-lg"
          />
        </a>
      ))}
    </div>
    </>
  );
};

export default CollagesRow;
