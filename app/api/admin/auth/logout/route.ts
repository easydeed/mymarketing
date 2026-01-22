import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getAdminSession();
    session.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
