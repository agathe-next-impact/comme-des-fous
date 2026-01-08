"use client";
import { usePathname } from "next/navigation";

interface HeroProps {
    titre: string;
    sousTitre?: string;
    className?: string;
}

export default function Hero({ titre, sousTitre, className }: HeroProps) {
  const pathname = usePathname();
    return (
        <div>
                <h1 className={`w-full pt-4 font-title font-bold text-[12.5vw] tracking-tight ${className}${pathname === "/" ? "text-white" : ""}`}>
                    {titre}
                </h1>
                {sousTitre && (
                <h2 className={`w-full font-title text-2xl mb-2 ${className}${pathname === "/" ? "text-white" : ""}`}>
                    {sousTitre}
                </h2>
                )}
        </div>
    );
}