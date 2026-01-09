import type { NextConfig } from "next";

const wordpressHostname = process.env.WORDPRESS_HOSTNAME;
const wordpressUrl = process.env.WORDPRESS_URL;

const nextConfig: NextConfig = {
  output: "standalone",
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
  async rewrites() {
    return [
      {
        source: "/:slug",
        destination: "/posts/:slug",
      },
    ];
  },
};

export default nextConfig;
