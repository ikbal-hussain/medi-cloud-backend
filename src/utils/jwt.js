import jwt from 'jsonwebtoken';
import { setting } from '../config/env.js';

// Deployed, a missing JWT_SECRET stops the server: the dev fallback is public, so tokens signed with it could be forged.
const JWT_SECRET = setting('JWT_SECRET', 'local-dev-only-jwt-secret');
const JWT_EXPIRES_IN = '7d';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

