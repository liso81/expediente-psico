import { NextResponse } from 'next/server';
import { COOKIE_NAME, tokenValido } from './lib/auth';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const esPublica =
    pathname === '/login' ||
    pathname === '/api/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  if (esPublica) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!tokenValido(token)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
