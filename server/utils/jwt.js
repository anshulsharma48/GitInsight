import jwt from 'jsonwebtoken';

/**
 * Generate a signed JSON Web Token for an authenticated user.
 * @param {string} userId - User ID string
 * @returns {string} Signed JWT
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'gitinsight_dev_fallback_secret_key_12345';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Verify a JSON Web Token.
 * @param {string} token - JWT string
 * @returns {object} Decoded payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'gitinsight_dev_fallback_secret_key_12345';
  return jwt.verify(token, secret);
};
