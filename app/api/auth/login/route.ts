import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get settings to check password
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'settings' },
      });
    }
    
    const isValidPassword = password === settings.galleryPassword;

    // Get IP and user agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user && isValidPassword) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    // Log the login attempt
    await prisma.loginLog.create({
      data: {
        userId: user?.id || null,
        email,
        success: isValidPassword,
        ipAddress: ipAddress.split(',')[0].trim(), // Get first IP if multiple
        userAgent: userAgent.substring(0, 500), // Limit length
      },
    });

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session
    const session = await getSession();
    session.userId = user!.id;
    session.email = email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ 
      success: true,
      user: { id: user!.id, email: user!.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

