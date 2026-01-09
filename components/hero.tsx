"use client";
import { usePathname } from "next/navigation";
import { DecodeFr } from "./decode-fr";

interface HeroProps {
    titre: string;
    sousTitre?: string;
    className?: string;
}

export default function Hero({ titre, sousTitre, className }: HeroProps) {
  const pathname = usePathname();
  const displayTitre = titre.length > 32 ? titre.substring(0, 32) + "..." : titre;
  const textSize = titre.length > 23 ? "text-[6vw]" : titre.length > 19 ? "text-[8vw]" : titre.length > 15 ? "text-[10vw]" : "text-[12.5vw]";
    return (
        <div>
                <h1 className={`w-full max-w-[100vw] pt-12 md:pt-0 font-title font-bold ${textSize} uppercase tracking-tight ${className}${pathname === "/" ? "text-white" : ""}`}>
                    <DecodeFr>{displayTitre}</DecodeFr>
                </h1>
                {sousTitre && (
                <h2 className={`w-full font-title text-2xl ${className}${pathname === "/" ? "text-white" : ""}`}>
                    <DecodeFr>{sousTitre}</DecodeFr>
                </h2>
                )}
        </div>
    );
}