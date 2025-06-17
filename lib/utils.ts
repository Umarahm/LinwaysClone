import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generates a deterministic HSL color based on a given string (e.g., user name)
export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    // Simple hash function
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Create hue from 0–360
  const hue = Math.abs(hash) % 360
  // Use constant saturation/lightness for pleasant pastel-ish colors
  return `hsl(${hue}, 70%, 60%)`
}
