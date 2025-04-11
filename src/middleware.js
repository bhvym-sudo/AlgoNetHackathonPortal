// /middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log("Middleware")

  // Check if the request is for the evaluator dashboard
  if (pathname.startsWith('/evaluator/dashboard')) {
    // Get the evaluator_session cookie
    const evaluatorSession = request.cookies.get('evaluator_session')?.value;
    
    // If the user is not authenticated, redirect to the login page
    if (evaluatorSession !== 'authenticated') {
      const url = new URL('/evaluator', request.url);
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/evaluator/dashboard/:path*'],
};