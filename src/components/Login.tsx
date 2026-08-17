import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/store/useAuthStore"

export const Login = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    setLoading(true)

    try {
      const data = await loginUser(email, password)
      setUser(data.user)
      navigate("/home")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = () => {
    setEmail("creator@qapp.com")
    setPassword("CreatorPass123!")
    setError(null)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-transparent p-4 dark:bg-background">
      <Card className="w-full max-w-md border-amber-900/15 bg-[#FFF4CC]/90 shadow-2xl shadow-amber-950/15 backdrop-blur-md ring-amber-900/5 dark:border-border/50 dark:bg-card/95 dark:shadow-black/40 dark:ring-foreground/10">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to your QApp creator account.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t border-amber-900/10 pt-4 text-center dark:border-border/40">
            <p className="text-xs font-medium text-muted-foreground">Quick Demo Account</p>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleQuickFill}>
              Creator
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
