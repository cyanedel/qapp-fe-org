import type { SubmitEvent } from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react"
import { registerUser } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

export const Register = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (!registered) return

    const redirectTimer = window.setTimeout(() => navigate("/login"), 5000)
    return () => window.clearTimeout(redirectTimer)
  }, [navigate, registered])

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Email and password are required.")
      return
    }

    setLoading(true)

    try {
      await registerUser(email, password)
      setRegistered(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-transparent px-4 pt-20 pb-6 dark:bg-background">
      <Card className="w-full max-w-md border-amber-900/15 bg-[#FFF4CC]/90 shadow-2xl shadow-amber-950/15 backdrop-blur-md ring-amber-900/5 dark:border-border/50 dark:bg-card/95 dark:shadow-black/40 dark:ring-foreground/10">
        {registered ? (
          <>
            <CardHeader className="space-y-2 pb-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Registration successful</CardTitle>
              <CardDescription>Your organization account is ready. Redirecting to sign in.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" className="w-full font-medium" onClick={() => navigate("/login")}>
                Go to Sign In
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 pb-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <UserPlus className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Create organization account</CardTitle>
              <CardDescription>Register to manage Potero creator tools.</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-9"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-9 pr-10"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full font-medium" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      Creating account...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 border-t border-amber-900/10 pt-4 text-center text-sm text-muted-foreground dark:border-border/40">
                <span>
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Sign In
                  </Link>
                </span>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
