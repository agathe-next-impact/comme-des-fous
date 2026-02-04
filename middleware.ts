import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Laisser passer les routes statiques connues
  const staticRoutes = [
    "/bedetheque",
    "/coups-de-coeur",
    "/playlist-musicale-de-fous",
    "/posts",
    "/pages",
  ];
  
  if (staticRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Pour les slugs dynamiques, ajouter un header pour forcer ISR
  if (pathname.match(/^\/[a-z0-9-]+$/i)) {
    const response = NextResponse.next();
    response.headers.set("x-middleware-cache", "no-cache");
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};