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
  const textSize = titre.length > 30 ? "text-2xl md:text-[3.5vw]" : titre.length > 23 ? "text-2xl md:text-[5.7vw]" : titre.length > 19 ? "text-2xl md:text-[6.2vw]" : titre.length > 15 ? "text-3xl md:text-[7.7vw]" : "text-3xl md:text-[9.5vw]";
    return (
        <div className="flex items-center px-4 pb-6 pt-32 md:pt-28">
            <div>
                <Image 
                    src="/logo.png"
                    alt="underline"
                    width={150}
                    height={20}
                    className="object-contain max-w-18"
                />
            </div>
            <div className="flex flex-col ml-4 md:ml-8">
                <h1 className={`w-full max-w-[100vw] font-title font-semibold ${textSize} uppercase tracking-tight ${className}${pathname === "/" ? "text-white" : ""}`}>
                    <DecodeFr>{titre}</DecodeFr>
                </h1>
                <div className="mt-0 flex justify-center gap-4">
                {sousTitre && (
                        <h2 className={`w-full font-title font-normal group-hover:underline text-lg md:text-3xl ${className}${pathname === "/" ? "text-white" : ""}`}>
                            <DecodeFr>{sousTitre}</DecodeFr>
                        </h2>
                )}
                </div>
            </div>
        </div>
    );
}