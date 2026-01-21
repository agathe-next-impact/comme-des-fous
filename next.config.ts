import type { NextConfig } from "next";

const wordpressHostname = process.env.WORDPRESS_HOSTNAME;
const wordpressUrl = process.env.WORDPRESS_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Augmenter le timeout pour la génération statique
  staticPageGenerationTimeout: 120,
  
  // ✅ Ajouter : forcer le rendu dynamique pour les routes catch-all
  experimental: {
    // (dynamicIO option removed - not supported in ExperimentalConfig)
  },
  
  images: {
    remotePatterns: [
      ...(wordpressHostname
        ? [
            {
              protocol: "https" as const,
              hostname: wordpressHostname,
              port: "",
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "commedesfous.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https" as const,
        hostname: "assets.pippa.io",
        port: "",
        pathname: "/**",
      },
    ],
    // ✅ Optimisations des images pour de meilleures performances
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours de cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  async redirects() {
    const redirectsList = [];
    
    if (wordpressUrl) {
      redirectsList.push({
        source: "/admin",
        destination: `${wordpressUrl}/wp-admin`,
        permanent: true,
      });
    }

    // Redirects pour les catégories avec slug simple
    redirectsList.push(
      {
        source: "/a-ecouter",
        destination: "/posts/categories/a-ecouter",
        permanent: false,
      },
      {
        source: "/a-lire",
        destination: "/posts/categories/a-lire",
        permanent: false,
      },
      {
        source: "/a-voir",
        destination: "/posts/categories/a-voir",
        permanent: false,
      }
    );

    return redirectsList;
  },
};

export default nextConfig;
