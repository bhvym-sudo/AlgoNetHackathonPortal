import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().delete('evaluator_session');

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
