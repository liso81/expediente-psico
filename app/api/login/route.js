import { NextResponse } from 'next/server';
import { COOKIE_NAME, generarTokenParaUsuario, encontrarUsuarioPorPassword } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { password } = await request.json();

  const userId = encontrarUsuarioPorPassword(password);
  if (!userId) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, generarTokenParaUsuario(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res;
}
