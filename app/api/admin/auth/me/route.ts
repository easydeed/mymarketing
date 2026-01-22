import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session.isAdmin || !session.adminId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin: adminUser });
  } catch (error) {
    console.error('Admin me error:', error);
    return NextResponse.json(
      { error: 'Failed to get admin info' },
      { status: 500 }
    );
  }
}
