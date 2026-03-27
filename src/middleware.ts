import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const ADMIN_PATHS = ['/admin'];
const LOGIN_PATH = '/admin/login';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except the login page itself)
  const isAdminRoute = ADMIN_PATHS.some(p => pathname.startsWith(p));
  const isLoginPage = pathname === LOGIN_PATH;

  if (!isAdminRoute || isLoginPage) {
    return NextResponse.next();
  }

  // Validate session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};