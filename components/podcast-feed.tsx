'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import { DecodeFr } from '@/components/decode-fr';

interface PodcastEpisode {
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  imageUrl?: string;
  guid: string;
}

interface PodcastFeedProps {
  feedUrl: string;
  maxEpisodes?: number;
}

export function PodcastFeed({ feedUrl, maxEpisodes = 10 }: PodcastFeedProps) {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [podcastInfo, setPodcastInfo] = useState<{
    title: string;
    description: string;
    imageUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        // Utiliser un proxy CORS ou une route API Next.js
        const response = await fetch(`/api/rss-proxy?url=${encodeURIComponent(feedUrl)}`);
        
        if (!response.ok) throw new Error('Erreur lors de la récupération du flux RSS');
        
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        // Extraire les informations du podcast
        const channel = xml.querySelector('channel');
        if (channel) {
          let channelImageUrl = '';
          
          // Essayer plusieurs méthodes pour l'image du podcast
          const itunesImage = channel.querySelector('image[href]') || 
                              channel.getElementsByTagName('itunes:image')[0];
          if (itunesImage) {
            channelImageUrl = itunesImage.getAttribute('href') || '';
          }
          
          // Format standard RSS image
          if (!channelImageUrl) {
            const imageUrl = channel.querySelector('image url');
            if (imageUrl) {
              channelImageUrl = imageUrl.textContent || '';
            }
          }
          
          setPodcastInfo({
            title: channel.querySelector('title')?.textContent || '',
            description: channel.querySelector('description')?.textContent || '',
            imageUrl: channelImageUrl,
          });
        }

        // Extraire les épisodes
        const items = Array.from(xml.querySelectorAll('item')).slice(0, maxEpisodes);
        const episodesData: PodcastEpisode[] = items.map((item) => {
          // Essayer plusieurs méthodes pour récupérer l'image
          let imageUrl = '';
          
          // Méthode 1: itunes:image avec namespace
          const itunesImage = item.querySelector('image[href]') || 
                              item.getElementsByTagName('itunes:image')[0];
          if (itunesImage) {
            imageUrl = itunesImage.getAttribute('href') || '';
          }
          
          // Méthode 2: image/url (format standard RSS)
          if (!imageUrl) {
            const imageElement = item.querySelector('image url');
            if (imageElement) {
              imageUrl = imageElement.textContent || '';
            }
          }
          
          // Méthode 3: Utiliser l'image du podcast si pas d'image d'épisode
          if (!imageUrl && podcastInfo?.imageUrl) {
            imageUrl = podcastInfo.imageUrl;
          }

          return {
            title: item.querySelector('title')?.textContent || '',
            description: item.querySelector('description')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || '',
            duration: item.querySelector('duration')?.textContent || 
                      item.getElementsByTagName('itunes:duration')[0]?.textContent || '',
            audioUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
            imageUrl,
            guid: item.querySelector('guid')?.textContent || '',
          };
        });

        setEpisodes(episodesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [feedUrl, maxEpisodes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDuration = (duration: string) => {
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return duration;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
        Erreur : {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête du podcast */}
      {podcastInfo && (
        <div className="flex flex-col md:flex-row gap-6 items-start bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          {podcastInfo.imageUrl && (
            <div className="hidden sm:block relative w-100 h-100 flex-shrink-0 overflow-hidden">
              <Image
                src={podcastInfo.imageUrl}
                alt={podcastInfo.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3"><DecodeFr>{podcastInfo.title}</DecodeFr></h2>
            <p className="text-muted-foreground leading-relaxed">
              <DecodeFr>{podcastInfo.description.replace(/<[^>]*>/g, '')}</DecodeFr>
            </p>
      {/* Liste des 3 premiers épisodes */}
      <div className="grid gri-cols-1 md:grid-cols-3 gap-16 mt-12">
        {episodes.slice(0,3).map((episode) => (
          <Card key={episode.guid} className="overflow-hidden border-b-[1px] border-b-(--color-blue) pb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 leading-tight">
                    <DecodeFr>{episode.title}</DecodeFr>
                  </CardTitle>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(episode.pubDate)}
                    </div>
                  </div>
                </div>
                {episode.imageUrl && episode.imageUrl.trim() !== '' && (
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={episode.imageUrl}
                      alt={episode.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription
                className="mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: episode.description }}
              />
              {episode.audioUrl && (
                <div className="space-y-2">
                  <audio
                    controls
                    preload="metadata"
                    className="w-full"
                    style={{ height: '40px' }}
                  >
                    <source src={episode.audioUrl} type="audio/mpeg" />
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {episode.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(episode.duration)}
                      </span>
                    )}
                    <a
                      href={episode.audioUrl}
                      download
                      className="hover:text-primary transition-colors"
                    >
                      Télécharger
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
          </div>
        </div>
      )}


    </div>
  );
}