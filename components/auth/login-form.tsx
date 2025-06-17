"use client"

import * as React from "react"
import { Eye, EyeOff, GraduationCap, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signIn } from "@/lib/auth-actions"

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const result = await signIn(email, password)

    if (result.success) {
      setMessage({ text: "Login successful! Redirecting...", type: "success" })
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
    } else {
      setMessage({ text: result.message, type: "error" })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">

      </div>

      <Card className="w-full max-w-md shadow-xl border border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Presidency University</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">Sign in to your learning portal</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@presidency.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-input focus:border-blue-500 focus:ring-blue-500 bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10 border-input focus:border-blue-500 focus:ring-blue-500 bg-background text-foreground"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {message && (
              <div className={`text-sm ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium"
              disabled={isLoading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <a href="/signup" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Don't have an account? Sign up
            </a>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">Demo credentials (All working accounts):</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>
                <strong className="text-foreground">Students (Password: student123):</strong>
              </p>
              <p className="ml-2">• alice.johnson@presidency.edu</p>
              <p className="ml-2">• bob.smith@presidency.edu</p>
              <p className="ml-2">• carol.davis@presidency.edu</p>
              <p className="ml-2">• david.wilson@presidency.edu</p>
              <p className="ml-2">• emma.brown@presidency.edu</p>

              <p className="pt-2">
                <strong className="text-foreground">Admin & Faculty (Password: password):</strong>
              </p>
              <p className="ml-2">• admin@presidency.edu (Admin)</p>
              <p className="ml-2">• dr.sarah@presidency.edu (Faculty)</p>
              <p className="ml-2">• prof.mike@presidency.edu (Faculty)</p>

              <p className="text-xs text-muted-foreground mt-2 italic">
                * All accounts now have proper authentication ✅
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
