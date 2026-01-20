"use client";

import { useState, useEffect, useCallback } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

// Déclaration globale pour grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: string | HTMLElement, options: any) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

interface CommentFormProps {
  postId: number;
  onCommentAdded?: () => void;
}

// Site key reCAPTCHA (public, peut être exposé)
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    content: "",
  });

  // Callback quand reCAPTCHA est chargé
  const onRecaptchaLoad = useCallback(() => {
    setRecaptchaReady(true);
  }, []);

  useEffect(() => {
    // Attacher le callback au window pour le script
    window.onRecaptchaLoad = onRecaptchaLoad;
    
    // Si grecaptcha est déjà chargé
    if (window.grecaptcha) {
      setRecaptchaReady(true);
    }

    return () => {
      delete window.onRecaptchaLoad;
    };
  }, [onRecaptchaLoad]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.author_name.trim()) {
      setError("Le pseudo est requis");
      return;
    }
    if (!formData.author_email.trim()) {
      setError("L'email est requis");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.author_email)) {
      setError("L'email n'est pas valide");
      return;
    }
    if (!formData.content.trim()) {
      setError("Le commentaire est requis");
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtenir le token reCAPTCHA v3 si configuré
      let captchaToken = "";
      if (RECAPTCHA_SITE_KEY && recaptchaReady && window.grecaptcha) {
        try {
          captchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
            action: "submit_comment",
          });
        } catch (captchaError) {
          console.error("reCAPTCHA error:", captchaError);
          setError("Erreur de vérification CAPTCHA. Rechargez la page.");
          setIsSubmitting(false);
          return;
        }
      }

      // Appel au proxy API interne (pas directement WordPress)
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          author_name: formData.author_name,
          author_email: formData.author_email,
          content: formData.content,
          captchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi");
      }

      setSuccess(true);
      setFormData({ author_name: "", author_email: "", content: "" });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        onCommentAdded?.();
      }, 3000);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors de l'envoi du commentaire"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12">
      {/* Charger reCAPTCHA v3 */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}&onload=onRecaptchaLoad`}
          strategy="lazyOnload"
        />
      )}

      <h3 className="text-2xl font-bold mb-6">Laisser un commentaire</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 text-red-200 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-600/20 border border-green-600 text-green-200 rounded">
          Commentaire envoyé avec succès ! Il sera affiché après modération.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="author_name"
              className="block text-sm font-medium mb-2"
            >
              Pseudo
            </label>
            <input
              type="text"
              id="author_name"
              name="author_name"
              value={formData.author_name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={cn(
                "w-full px-3 py-2 bg-white/10 border border-white/20 rounded",
                "text-white placeholder-white/50 outline-none",
                "focus:border-primary focus:bg-white/15 transition",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              placeholder="Votre pseudo"
              required
            />
          </div>

          <div>
            <label
              htmlFor="author_email"
              className="block text-sm font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="author_email"
              name="author_email"
              value={formData.author_email}
              onChange={handleChange}
              disabled={isSubmitting}
              className={cn(
                "w-full px-3 py-2 bg-white/10 border border-white/20 rounded",
                "text-white placeholder-white/50 outline-none",
                "focus:border-primary focus:bg-white/15 transition",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              placeholder="votre@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Commentaire
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={5}
            className={cn(
              "w-full px-3 py-2 bg-white/10 border border-white/20 rounded",
              "text-white placeholder-white/50 outline-none",
              "focus:border-primary focus:bg-white/15 transition resize-none",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            placeholder="Votre commentaire..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "px-6 py-2 bg-primary text-white font-medium rounded",
            "hover:bg-primary/90 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer le commentaire"}
        </button>
      </form>
    </div>
  );
}
