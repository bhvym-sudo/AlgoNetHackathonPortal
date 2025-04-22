import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read toggle state from cookie
  const toggleCookie = request.cookies.get('admin_toggle_state')?.value;
  const toggles = toggleCookie ? JSON.parse(toggleCookie) : {};

  // Admin auth
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin-login')) {
    const session = request.cookies.get('admin_session')?.value;
    if (session !== 'authenticated') {
      const url = new URL('/admin-login', request.url);
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
  }

  // Existing BTECH evaluator dashboard protection
  if (pathname.startsWith('/evaluator/dashboard')) {
    if (!toggles.evaluatorRound1) {
      return NextResponse.redirect(new URL('/disabled', request.url));
    }
    const evalSession = request.cookies.get('evaluator_session')?.value;
    if (evalSession !== 'authenticated') {
      const url = new URL('/evaluator', request.url);
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
  }

  // --- Add MCA evaluator dashboard protection ---
  if (pathname.startsWith('/mca/evaluator/dashboard')) {
    const mcaEvalSession = request.cookies.get('mca_evaluator_session')?.value;
    if (mcaEvalSession !== 'authenticated') {
      const url = new URL('/mca/evaluator', request.url);
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/mca/roundtwohackathon/Evaluator/dashboard')) {
    const mcaEvalSession = request.cookies.get('mca_evaluator_session')?.value;
    if (mcaEvalSession !== 'authenticated') {
      const url = new URL('/mca/roundtwohackathon/Evaluator', request.url);
      url.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/' && toggles.studentRound1 === false) {
    return NextResponse.redirect(new URL('/disabled', request.url));
  }

  if (pathname.startsWith('/roundtwohackathon/Student') && toggles.studentRound2 === false) {
    return NextResponse.redirect(new URL('/disabled', request.url));
  }

  if (pathname.startsWith('/roundtwohackathon/Evaluator') && toggles.evaluatorRound2 === false) {
    return NextResponse.redirect(new URL('/disabled', request.url));
  }

  return NextResponse.next();
}
 