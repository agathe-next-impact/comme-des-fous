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
    return (
        <div>
                <h1 className={`w-full pt-4 font-title font-bold text-[12.5vw] tracking-tight ${className}${pathname === "/" ? "text-white" : ""}`}>
                    <DecodeFr>{titre}</DecodeFr>
                </h1>
                {sousTitre && (
                <h2 className={`w-full font-title text-2xl mb-2 ${className}${pathname === "/" ? "text-white" : ""}`}>
                    <DecodeFr>{sousTitre}</DecodeFr>
                </h2>
                )}
        </div>
    );
}