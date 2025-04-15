
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log("Middleware")

  
  if (pathname.startsWith('/evaluator/dashboard')) {
    
    const evaluatorSession = request.cookies.get('evaluator_session')?.value;
    
    
    if (evaluatorSession !== 'authenticated') {
      const url = new URL('/evaluator', request.url);
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
  }

  
  return NextResponse.next();
}

export const config = {
  matcher: ['/evaluator/dashboard/:path*'],
};