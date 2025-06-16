// Authentication configuration
export const AUTH_CONFIG = {
  sessionSecret: process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret",
  cookieSecret: process.env.COOKIE_SECRET || "fallback-cookie-secret",
  sessionMaxAge: Number.parseInt(process.env.SESSION_MAX_AGE || "604800"), // 7 days in seconds
  cookieSecure: process.env.NODE_ENV === "production",
  cookieSameSite: "lax" as const,
  cookieHttpOnly: true,
}

// Validate auth configuration
if (!AUTH_CONFIG.sessionSecret || AUTH_CONFIG.sessionSecret === "fallback-secret") {
  console.warn(
    "Warning: Using fallback session secret. Please set SESSION_SECRET or NEXTAUTH_SECRET in your .env.local file.",
  )
}

// Password validation rules
export const PASSWORD_RULES = {
  minLength: Number.parseInt(process.env.PASSWORD_MIN_LENGTH || "6"),
  requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === "true",
  requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === "true",
  requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === "true",
  requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === "true",
}

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  maxAttempts: Number.parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
  windowMs: Number.parseInt(process.env.LOGIN_WINDOW_MS || "900000"), // 15 minutes
  blockDuration: Number.parseInt(process.env.LOGIN_BLOCK_DURATION || "900000"), // 15 minutes
}
