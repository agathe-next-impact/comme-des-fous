import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting (en production, utiliser Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 commentaires max par minute par IP

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimit.get(key);

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// Validation basique anti-spam
function validateContent(content: string): { valid: boolean; reason?: string } {
  // Trop court
  if (content.trim().length < 5) {
    return { valid: false, reason: "Le commentaire est trop court" };
  }

  // Trop de liens
  const linkCount = (content.match(/https?:\/\//gi) || []).length;
  if (linkCount > 3) {
    return { valid: false, reason: "Trop de liens dans le commentaire" };
  }

  // Patterns spam courants
  const spamPatterns = [
    /\b(viagra|cialis|casino|poker|lottery|bitcoin\s*invest)/i,
    /\b(make\s*money\s*fast|work\s*from\s*home\s*\$)/i,
    /(.)\1{10,}/, // Répétition excessive de caractères
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return { valid: false, reason: "Contenu détecté comme spam" };
    }
  }

  return { valid: true };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  // Vérifier la configuration WordPress
  const wordpressUrl = process.env.WORDPRESS_URL;
  const wpUser = process.env.WP_APPLICATION_USER;
  const wpPassword = process.env.WP_APPLICATION_PASSWORD;

  if (!wordpressUrl) {
    console.error("[API Comments] WORDPRESS_URL not configured");
    return NextResponse.json(
      { error: "Service non configuré" },
      { status: 503 }
    );
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(request);
  const { allowed, remaining } = checkRateLimit(rateLimitKey);

  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans une minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Parser le body
  let body: {
    postId: number;
    author_name: string;
    author_email: string;
    content: string;
    captchaToken?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Données invalides" },
      { status: 400 }
    );
  }

  const { postId, author_name, author_email, content, captchaToken } = body;

  // Validations
  if (!postId || !author_name || !author_email || !content) {
    return NextResponse.json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );
  }

  if (!validateEmail(author_email)) {
    return NextResponse.json(
      { error: "Adresse email invalide" },
      { status: 400 }
    );
  }

  const contentValidation = validateContent(content);
  if (!contentValidation.valid) {
    return NextResponse.json(
      { error: contentValidation.reason },
      { status: 400 }
    );
  }

  // Vérification Google reCAPTCHA si configuré
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (recaptchaSecret) {
    if (!captchaToken) {
      return NextResponse.json(
        { error: "Vérification CAPTCHA requise" },
        { status: 400 }
      );
    }

    try {
      const recaptchaResponse = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: recaptchaSecret,
            response: captchaToken,
          }),
        }
      );

      const recaptchaResult = await recaptchaResponse.json();
      
      // Pour reCAPTCHA v3, vérifier aussi le score (0.0 = bot, 1.0 = humain)
      const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");
      
      if (!recaptchaResult.success) {
        console.warn("[API Comments] reCAPTCHA verification failed:", recaptchaResult);
        return NextResponse.json(
          { error: "Vérification CAPTCHA échouée" },
          { status: 400 }
        );
      }
      
      // Si c'est reCAPTCHA v3, vérifier le score
      if (recaptchaResult.score !== undefined && recaptchaResult.score < minScore) {
        console.warn("[API Comments] reCAPTCHA score too low:", recaptchaResult.score);
        return NextResponse.json(
          { error: "Vérification CAPTCHA échouée (score insuffisant)" },
          { status: 400 }
        );
      }
      
      console.log("[API Comments] reCAPTCHA passed, score:", recaptchaResult.score);
    } catch (error) {
      console.error("[API Comments] reCAPTCHA error:", error);
      return NextResponse.json(
        { error: "Erreur de vérification CAPTCHA" },
        { status: 500 }
      );
    }
  }

  // Construire la requête vers WordPress
  const wpCommentUrl = new URL("/wp-json/wp/v2/comments", wordpressUrl);

  // Récupérer l'IP du visiteur pour la transmettre à WordPress (aide anti-spam)
  const forwarded = request.headers.get("x-forwarded-for");
  const visitorIp = forwarded ? forwarded.split(",")[0].trim() : "";
  const userAgent = request.headers.get("user-agent") || "";

  const wpBody: Record<string, any> = {
    post: postId,
    author_name: author_name.trim(),
    author_email: author_email.trim().toLowerCase(),
    content: content.trim(),
  };

  // Ajouter l'IP et User-Agent du visiteur original (aide WordPress/Akismet)
  if (visitorIp) {
    wpBody.author_ip = visitorIp;
  }
  if (userAgent) {
    wpBody.author_user_agent = userAgent;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Next.js Comments Proxy",
  };

  // Ajouter l'authentification si configurée
  if (wpUser && wpPassword) {
    const authString = Buffer.from(`${wpUser}:${wpPassword}`).toString("base64");
    headers["Authorization"] = `Basic ${authString}`;
  }

  try {
    console.log("[API Comments] Posting to WordPress:", wpCommentUrl.toString());

    const wpResponse = await fetch(wpCommentUrl.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(wpBody),
    });

    const wpResponseText = await wpResponse.text();
    console.log("[API Comments] WordPress response status:", wpResponse.status);

    if (!wpResponse.ok) {
      let errorMessage = "Erreur lors de la création du commentaire";
      try {
        const errorData = JSON.parse(wpResponseText);
        errorMessage = errorData.message || errorMessage;
        console.error("[API Comments] WordPress error:", errorData);
      } catch {
        console.error("[API Comments] WordPress error:", wpResponseText);
      }

      // Ne pas exposer les détails d'erreur WordPress au client
      return NextResponse.json(
        { error: errorMessage },
        { status: wpResponse.status >= 500 ? 503 : 400 }
      );
    }

    const comment = JSON.parse(wpResponseText);
    console.log("[API Comments] Comment created with ID:", comment.id);

    return NextResponse.json(
      {
        success: true,
        message: "Commentaire envoyé. Il sera visible après modération.",
        commentId: comment.id,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error("[API Comments] Fetch error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion au serveur" },
      { status: 503 }
    );
  }
}
