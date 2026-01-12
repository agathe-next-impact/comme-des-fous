import { useEffect, useState } from 'react';
import { stripHtml, decodeHtmlEntities } from '@/lib/metadata';

export interface WPMetadata {
  id: number;
  title: { rendered: string } | string;
  date: string;
  author: string;
  excerpt: { rendered: string } | string;
  [key: string]: any;
}

interface WPMetadataFetcherProps {
  endpoint: string; // URL de l'API REST WordPress (ex: /wp-json/wp/v2/posts)
  params?: Record<string, string | number>;
  onLoaded?: (data: WPMetadata[]) => void;
}

export function WPMetadataFetcher({ endpoint, params, onLoaded }: WPMetadataFetcherProps) {
  const [data, setData] = useState<WPMetadata[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = new URL(endpoint, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    fetch(url.toString())
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors de la récupération des métadonnées');
        return res.json();
      })
      .then((json) => {
        setData(json);
        onLoaded?.(json);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(params)]);

  if (loading) return <div>Chargement des métadonnées...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h3>{decodeHtmlEntities(stripHtml('Métadonnées WordPress'))}</h3>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            <strong>{decodeHtmlEntities(stripHtml(typeof item.title === 'object' ? item.title.rendered : item.title))}</strong> — {item.date} — {item.author}
            <div>{decodeHtmlEntities(stripHtml(typeof item.excerpt === 'object' ? item.excerpt.rendered : item.excerpt))}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WPMetadataFetcher;
