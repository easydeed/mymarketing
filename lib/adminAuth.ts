import { getAdminSession } from './session';

export async function requireAdmin() {
  const session = await getAdminSession();
  
  if (!session.isAdmin || !session.adminId) {
    return { authenticated: false, adminId: null };
  }
  
  return { authenticated: true, adminId: session.adminId };
}
