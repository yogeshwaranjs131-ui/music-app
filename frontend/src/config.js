// This will use the VITE_API_URL environment variable if it exists (in production),
// otherwise it falls back to localhost (in development).
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const UPLOADS_URL = `${API_URL}/uploads`;