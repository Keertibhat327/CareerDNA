import bcrypt from 'bcryptjs';

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} password - The plain-text password.
 * @returns {Promise<string>} The hashed password.
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain-text password with a hash.
 * @param {string} password - The plain-text password.
 * @param {string} hashed - The hashed password to compare against.
 * @returns {Promise<boolean>} Match result.
 */
export async function comparePassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}
