import { HttpResponse } from 'msw';
import { extractUserIdFromToken } from './token';
import { findUserById } from '../data';
import { UserRole } from '@entities/user';

/**
 * Returns 403 response if the authenticated user has role STAFF.
 * Use at the start of write handlers (POST, PUT, PATCH, DELETE) for read-only resources.
 * Returns null if the user is not STAFF (allow the request to continue).
 */
export function forbidStaffWrite(
  request: Request
): HttpResponse<{ error: string; code: string }> | null {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || '';
  const userId = extractUserIdFromToken(token);
  const user = userId ? findUserById(userId) : null;
  if (user?.role === UserRole.STAFF) {
    return HttpResponse.json(
      {
        error: 'No tiene permisos para realizar esta acción',
        code: 'FORBIDDEN',
      },
      { status: 403 }
    );
  }
  return null;
}
