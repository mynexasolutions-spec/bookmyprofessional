import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { role, next } = await request.json();
    const response = NextResponse.json({ ok: true });
    if (role) {
      response.cookies.set('oauth_role', role, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 600,
      });
    }
    if (next) {
      response.cookies.set('oauth_next', next, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 600,
      });
    }
    return response;
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
