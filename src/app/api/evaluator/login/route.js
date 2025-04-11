import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    
    const validUsername = process.env.EVALUATOR_USERNAME;
    const validPassword = process.env.EVALUATOR_PASSWORD;

    
    if (!validUsername || !validPassword) {
      console.error('Evaluator credentials not configured in environment variables');
      return NextResponse.json(
        { message: 'Authentication service misconfigured' }, 
        { status: 500 }
      );
    }

    
    if (username === validUsername && password === validPassword) {
      
      const response = NextResponse.json({ 
        success: true, 
        message: 'Login successful' 
      });
      
      
      response.cookies.set('evaluator_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, 
        path: '/',
      });

      return response;
    }

    
    return NextResponse.json(
      { message: 'Invalid username or password' }, 
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during authentication' }, 
      { status: 500 }
    );
  }
}