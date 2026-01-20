"use client";
import { usePathname } from "next/navigation";
import { DecodeFr } from "./decode-fr";
import Image from "next/image";

interface HeroProps {
    titre: string;
    sousTitre?: string;
    className?: string;
}

export default function Hero({ titre, sousTitre, className }: HeroProps) {
  const pathname = usePathname();
  const textSize = titre.length > 30 ? "text-[4vw]" : titre.length > 23 ? "text-[5.7vw]" : titre.length > 19 ? "text-[6.2vw]" : titre.length > 15 ? "text-[7.7vw]" : "text-[11.5vw]";
    return (
        <div className="px-4 pb-6 pt-12">
                <h1 className={`w-full max-w-[100vw] font-title font-bold ${textSize} uppercase tracking-tight ${className}${pathname === "/" ? "text-white" : ""}`}>
                    <DecodeFr>{titre}</DecodeFr>
                </h1>
                <div className="flex justify-center items-center gap-4">
                <Image 
                    src="/logo.png"
                    alt="underline"
                    width={80}
                    height={20}
                />
                {sousTitre && (
                <h2 className={`w-full  font-title font-normal leading-snug letter-spacing-widest group-hover:underline text-3xl ${className}${pathname === "/" ? "text-white" : ""}`}>
                    <DecodeFr>{sousTitre}</DecodeFr>
                </h2>
                )}
                </div>
        </div>
    );
}