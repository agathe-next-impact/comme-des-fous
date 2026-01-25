"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ExternalLink, Music, ChevronDown, Disc3 } from "lucide-react"

interface Song {
  title: string
  artist: string
  link?: string
}

interface JukeboxPlaylistProps {
  songs: Song[]
  title?: string
  initialRevealCount?: number
}

function VinylDisc({ isSpinning, className, color = "blue" }: { isSpinning: boolean; className?: string; color?: "blue" | "red" }) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "w-32 h-32 rounded-full bg-black border-4 border-white/10 shadow-2xl",
          "flex items-center justify-center",
          isSpinning && "animate-spin"
        )}
        style={{ animationDuration: "3s" }}
      >
        {/* Grooves */}
        <div className="absolute inset-3 rounded-full border border-white/5" />
        <div className="absolute inset-6 rounded-full border border-white/10" />
        <div className="absolute inset-9 rounded-full border border-white/5" />
        <div className="absolute inset-11 rounded-full border border-white/10" />
        
        {/* Center label */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center z-10",
          color === "blue" ? "bg-blue-400" : "bg-red-500"
        )}>
          <div className="w-2 h-2 rounded-full bg-black" />
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
      </div>
    </div>
  )
}

function SongSlot({
  song,
  index,
  isRevealed,
  isSelected,
  onSelect,
}: {
  song: Song
  index: number
  isRevealed: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  const slotCode = `${String.fromCharCode(65 + Math.floor(index / 10))}${(index % 10) + 1}`
  const hasLink = Boolean(song.link)

  const handleClick = () => {
    if (hasLink && song.link) {
      onSelect();
      window.open(song.link, "_blank", "noopener,noreferrer")
      return
    }
    onSelect()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group relative w-full text-left transition-all duration-500",
        "border border-yellow-500 rounded-full overflow-hidden",
        "dark:bg-black",              // force fond blanc (light) / noir (dark)
        "hover:border-yellow-500/60 hover:shadow-[0_0_20px_rgba(234,179,8,0.25)]",
        isSelected && "border-white-500 shadow-[0_0_25px_rgba(234,179,8,0.35)]",
        !isRevealed && "opacity-0 translate-y-4",
        isRevealed && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: isRevealed ? `${index * 80}ms` : "0ms" }}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Slot code badge */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            "bg-blue-500", // fond light/dark conservé
            hasLink
              ? "bg-red-500 text-red-500 group-hover:text-yellow-900 group-hover:bg-yellow-500"
              : "text-slate-900 group-hover:text-yellow-900",
            "font-mono text-sm font-bold",
            "transition-colors duration-300",
            isSelected && "bg-blue-400 text-black"
          )}
        >
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-medium truncate",
              "text-slate-900 dark:text-blue-400",
              hasLink ? "text-red-500 dark:text-red-400 group-hover:text-yellow-500" : "group-hover:text-blue-500",
              "transition-colors",
              isSelected && "text-blue-500"
            )}
          >
            {song.title}
          </p>
          <p
            className={cn(
              "text-sm truncate",
              "text-slate-500 dark:text-white/50"
            )}
          >
            {song.artist}
          </p>
        </div>

        {/* Link indicator */}
        {hasLink && (
          <a
            href={song.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex-shrink-0 p-2 rounded-2xl",
              "text-red-500 dark:text-red-400 group-hover:text-yellow-500 hover:bg-blue-400/10",
              isSelected && "text-blue-500",
              "transition-all duration-300"
            )}
            aria-label={`Ecouter ${song.title}`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Playing indicator (only when a link exists) */}
        {hasLink && isSelected && (
          <div className="flex gap-0.5 items-end h-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 bg-blue-400 rounded-full animate-pulse"
                style={{
                  height: `${8 + Math.random() * 8}px`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: "0.5s",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

export function JukeboxPlaylist({
  songs,
  title = "Ma Playlist",
  initialRevealCount = 3,
}: JukeboxPlaylistProps) {
  const [revealedCount, setRevealedCount] = useState(initialRevealCount)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const visibleSongs = songs.slice(0, revealedCount)
  const hasMoreSongs = revealedCount < songs.length
  const remainingCount = songs.length - revealedCount

  const revealMore = () => {
    setRevealedCount((prev) => Math.min(prev + 5, songs.length))
  }

  const revealAll = () => {
    setRevealedCount(songs.length)
  }

  return (
    <div className="w-full max-w-2xl mx-auto text-slate-900 dark:text-white">
      {/* Jukebox Header */}
      <div className="relative mb-8">
        {/* Neon-style title */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
          <div className="relative">
            <div className="absolute inset-0 blur-lg bg-blue-400/20 -z-10" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
        </div>

        {/* Vinyl and decorations */}
        <div className="flex items-center justify-center gap-8">
          <VinylDisc isSpinning={selectedIndex !== null} color="red" className="hidden sm:block" />
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 dark:text-gray-500">
              <Music className="w-5 h-5" />
              <span className="text-sm font-medium">{songs.length} titres</span>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-8 rounded-full transition-all duration-300",
                    selectedIndex !== null
                      ? "bg-blue-400 animate-pulse"
                      : "bg-gray-500"
                  )}
                  style={{
                    animationDelay: `${i * 100}ms`,
                    height: selectedIndex !== null ? `${16 + Math.random() * 16}px` : "32px",
                  }}
                />
              ))}
            </div>
          </div>

          <VinylDisc isSpinning={selectedIndex !== null} color="blue" className="hidden sm:block" />
        </div>
      </div>

      {/* Song List */}
      <div className="relative">
        <div className="space-y-2 p-4 bg-white/60 dark:bg-transparent rounded-2xl">
          {visibleSongs.map((song, index) => (
            <SongSlot
              key={`${song.title}-${song.artist}`}
              song={song}
              index={index}
              isRevealed={true}
              isSelected={selectedIndex === index}
              onSelect={() => setSelectedIndex(selectedIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Reveal Controls */}
        {hasMoreSongs && (
          <div className="border-t border-slate-200 dark:border-white/10 p-4 bg-white/60 dark:bg-transparent rounded-b-2xl">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={revealMore}
                className={cn(
                  "group flex items-center gap-2 px-6 py-3 rounded-full",
                  "bg-yellow-500 text-white",
                  "hover:bg-yellow-500 hover:text-white",
                  "transition-all duration-300",
                  "hover:shadow-[0_0_20px_rgba(234,179,8,0.35)]"
                )}
              >
                <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
                <span className="font-medium">
                  Découvrir plus ({remainingCount} restants)
                </span>
              </button>

              <button
                onClick={revealAll}
                className={cn(
                  "px-4 py-3 rounded-full",
                  "text-yellow-500 hover:text-yellow-600",
                  "transition-colors duration-300",
                  "underline-offset-4 hover:underline"
                )}
              >
                Tout afficher
              </button>
            </div>
          </div>
        )}

        {/* All revealed indicator */}
        {!hasMoreSongs && revealedCount > initialRevealCount && (
          <div className="border-t border-slate-200 dark:border-white/10 p-4 bg-white/60 dark:bg-transparent rounded-b-2xl">
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-white/50">
              <Disc3 className="w-5 h-5" />
              <span className="text-sm">Toute la playlist est visible</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
