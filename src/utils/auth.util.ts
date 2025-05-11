// src/utils/auth.util.ts
import { JwtService } from '@nestjs/jwt';

/**
 * Tries to extract user ID from the Authorization header.
 * If the header is not present or invalid, returns null.
 *
 * @param authHeader — Authorization header from the request
 * @param jwtService — JWT service for verifying tokens
 */
export function extractUserIdFromAuthHeader(
  authHeader: string | undefined,
  jwtService: JwtService,
): string | undefined {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return undefined;
  }

  const token = authHeader.slice(7).trim();
  try {
    const payload = jwtService.verify<{ id: string }>(token);
    return payload.id;
  } catch {
    return undefined;
  }
}
