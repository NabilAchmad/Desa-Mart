import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'desamart-super-secret-key-for-mobile-api';

export async function verifyMobileToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload; // contains { userId, role, email, name }
  } catch (error) {
    return null;
  }
}
