import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Paths that don't require authentication
    const isPublicPath = path === '/login' || path === '/signup' || path === '/';

    const token = request.cookies.get('token')?.value || '';

    // If user is authenticated and tries to access login/signup, redirect to home
    if (isPublicPath && token && (path === '/login' || path === '/signup')) {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }

    // If user is unauthenticated and tries to access protected paths, redirect to login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }

    // Allow request to proceed for other cases
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/profile',
        '/login',
        '/signup',
    ],
};
