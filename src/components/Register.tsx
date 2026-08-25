import type { SubmitEvent } from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { registerUser } from "@/api/auth"
import { ApiError } from "@/api/response"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { LanguageSelector } from "@/components/LanguageSelector"

export const Register = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const appName = t("app.name")
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

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError(t("register.validation.emailRequired"))
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(t("register.validation.emailInvalid"))
      return
    }

    if (!password) {
      setError(t("register.validation.passwordRequired"))
      return
    }

    setLoading(true)

    try {
      await registerUser(normalizedEmail, password)
      setRegistered(true)
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? t(`errors.${err.code}`, { defaultValue: t("errors.generic") })
        : t("errors.generic")
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-transparent px-4 pt-20 pb-6 dark:bg-background">
      <Card className="grid w-full max-w-4xl overflow-hidden border-amber-900/15 bg-[#FFF4CC]/90 shadow-2xl shadow-amber-950/15 backdrop-blur-md ring-amber-900/5 dark:border-border/50 dark:bg-card/95 dark:shadow-black/40 dark:ring-foreground/10 lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-amber-900/5 p-10 dark:bg-muted lg:flex">
          <div>
            <span className="block text-4xl font-semibold tracking-[-0.06em] text-primary">{appName}</span>
            <div className="auth-hero-copy">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight">{t("register.heroTitle")}</h2>
              <p className="max-w-sm text-base leading-7 text-muted-foreground">{t("register.heroDescription")}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("register.heroFooter")}</p>
        </section>

        <div className="min-w-0">
        {registered ? (
          <>
            <CardHeader className="space-y-2 pb-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">{t("register.successTitle")}</CardTitle>
              <CardDescription>{t("register.successDescription", { seconds: 5 })}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" className="w-full font-medium" onClick={() => navigate("/login")}>
                {t("register.goToSignIn")}
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 pb-6 text-center">
              <div className="mx-auto mb-2 flex w-32 items-center justify-center">
                <span className="text-3xl font-semibold tracking-[-0.06em] text-primary">{appName}</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">{t("register.title")}</CardTitle>
              <CardDescription>{t("register.description", { appName })}</CardDescription>
            </CardHeader>

            <form noValidate onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-email">{t("common.emailAddress")}</Label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={t("register.emailPlaceholder")}
                      className="pl-9"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">{t("common.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("register.passwordPlaceholder")}
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
                      aria-label={showPassword ? t("register.hidePassword") : t("register.showPassword")}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full font-medium" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      {t("register.creating")}
                    </>
                  ) : (
                    t("register.register")
                  )}
                </Button>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 border-t border-amber-900/10 pt-4 text-center text-sm text-muted-foreground dark:border-border/40">
                <span>
                  {t("register.hasAccount")} {" "}
                  <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                    {t("register.signIn")}
                  </Link>
                </span>
              </CardFooter>
            </form>
          </>
        )}
        </div>
      </Card>
      <LanguageSelector className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6" />
    </div>
  )
}
