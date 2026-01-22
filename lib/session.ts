import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

// Gallery user session
export interface SessionData {
  userId?: string;
  email?: string;
  isLoggedIn: boolean;
}

// Admin user session
export interface AdminSessionData {
  adminId?: string;
  email?: string;
  isAdmin: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'promovault_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export const adminSessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'promovault_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const defaultAdminSession: AdminSessionData = {
  isAdmin: false,
};

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

export async function getAdminSession() {
  const session = await getIronSession<AdminSessionData>(await cookies(), adminSessionOptions);

  if (!session.isAdmin) {
    session.isAdmin = defaultAdminSession.isAdmin;
  }

  return session;
}
