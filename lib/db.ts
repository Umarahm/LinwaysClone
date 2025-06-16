import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import "./env-validation" // This will run validation on import

// Validate required environment variables
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
}

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}. ` +
    "Please check your .env.local file and ensure all required variables are set.",
  )
}

// Initialize database connection
export const sql = neon(process.env.DATABASE_URL!)

// Configuration constants
export const DB_CONFIG = {
  maxConnections: Number.parseInt(process.env.DB_MAX_CONNECTIONS || "10"),
  connectionTimeout: Number.parseInt(process.env.DB_CONNECTION_TIMEOUT || "30000"),
  queryTimeout: Number.parseInt(process.env.DB_QUERY_TIMEOUT || "60000"),
}

// Helper function to hash passwords using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// Helper function to verify passwords using bcrypt
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Database health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as health_check`
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Helper function to safely execute queries with error handling
export async function safeQuery<T>(queryFn: () => Promise<T>, errorMessage = "Database query failed"): Promise<T> {
  try {
    return await queryFn()
  } catch (error) {
    console.error(`${errorMessage}:`, errorMessage)
    throw new Error(errorMessage)
  }
}
