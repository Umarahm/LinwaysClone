// Environment validation utility
export function validateEnvironment() {
  const requiredVars = ["DATABASE_URL"]

  const optionalVars = ["SESSION_SECRET", "NEXTAUTH_SECRET", "COOKIE_SECRET", "NODE_ENV", "NEXT_PUBLIC_APP_URL"]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env.local file and ensure all required variables are set.",
    )
  }

  const warnings = optionalVars.filter((varName) => !process.env[varName])

  if (warnings.length > 0) {
    console.warn(
      `Warning: Missing optional environment variables: ${warnings.join(", ")}\n` +
        "The application will use default values, but it's recommended to set these variables.",
    )
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgresql://")) {
    console.warn("Warning: DATABASE_URL should start with 'postgresql://' for Neon compatibility")
  }

  console.log("✅ Environment validation completed")
}

// Call validation on module load
if (typeof window === "undefined") {
  // Only run on server side
  validateEnvironment()
}
