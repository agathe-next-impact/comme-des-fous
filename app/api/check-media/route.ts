import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: "urls must be an array" }, { status: 400 });
    }

    const results = await Promise.all(
      urls.map(async (url: string) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(url, {
            method: "HEAD",
            signal: controller.signal,
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; MediaChecker/1.0)",
            },
          });

          clearTimeout(timeout);
          return { url, valid: res.ok };
        } catch {
          return { url, valid: false };
        }
      })
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}