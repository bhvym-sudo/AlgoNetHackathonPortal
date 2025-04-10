// /app/api/evaluator/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Get credentials from environment variables
    const validUsername = process.env.EVALUATOR_USERNAME;
    const validPassword = process.env.EVALUATOR_PASSWORD;

    // Check if credentials are provided in environment variables
    if (!validUsername || !validPassword) {
      console.error('Evaluator credentials not configured in environment variables');
      return NextResponse.json(
        { message: 'Authentication service misconfigured' }, 
        { status: 500 }
      );
    }

    // Validate credentials
    if (username === validUsername && password === validPassword) {
      // Create the response
      const response = NextResponse.json({ 
        success: true, 
        message: 'Login successful' 
      });
      
      // Set authentication cookie on the response
      response.cookies.set('evaluator_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    }

    // If credentials don't match, return error
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