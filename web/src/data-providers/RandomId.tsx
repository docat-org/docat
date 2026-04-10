// Generate a mostly random key
export const generateKey = () => {
  // Use the native function not available in http mode
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
