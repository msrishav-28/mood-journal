/**
 * NeonDB Postgres client — PLACEHOLDER
 * 
 * When real credentials are provided in .env, this module will use
 * @neondatabase/serverless to connect to NeonDB's serverless Postgres.
 * For now, all service modules fall back to localStorage / mock data.
 */

const DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL;

export const isDbConfigured = () => {
  return DATABASE_URL && !DATABASE_URL.includes('your-neon-host');
};

/**
 * Placeholder query runner.
 * Replace with real Neon serverless driver when ready:
 * 
 *   import { neon } from '@neondatabase/serverless';
 *   const sql = neon(DATABASE_URL);
 *   const result = await sql`SELECT * FROM entries WHERE user_id = ${userId}`;
 */
export const query = async (text, params = []) => {
  if (!isDbConfigured()) {
    console.warn('[db] NeonDB not configured — using local fallback.');
    return { rows: [] };
  }

  // TODO: Replace with real Neon query
  console.log('[db] Would execute:', text, params);
  return { rows: [] };
};

export default { query, isDbConfigured };
