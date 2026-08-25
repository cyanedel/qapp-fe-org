import type { SubmitEvent } from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getCurrentUser, loginUser } from "@/api/auth"
import { ApiError } from "@/api/response"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { LanguageSelector } from "@/components/LanguageSelector"
import { useAuthStore } from "@/store/useAuthStore"

const demoAccounts = [
  { number: 1, email: "creator-alice@potero.com", password: "SeedPass123!" },
  { number: 2, email: "creator-bob@potero.com", password: "SeedPass123!" },
  { number: 3, email: "creator-charlie@potero.com", password: "SeedPass123!" },
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const Login = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const { t } = useTranslation()
  const appName = t("app.name")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError(t("login.validation.emailRequired"))
      return
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError(t("login.validation.emailInvalid"))
      return
    }

    if (!password) {
      setError(t("login.validation.passwordRequired"))
      return
    }

    setLoading(true)

    try {
      await loginUser(normalizedEmail, password)
      const user = await getCurrentUser()
      setUser(user)
      navigate("/home")
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? t(`errors.${err.code}`, { defaultValue: t("errors.generic") })
        : t("errors.generic")
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (account: (typeof demoAccounts)[number]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-transparent px-4 py-10 dark:bg-background">
      <Card className="grid w-full max-w-4xl overflow-hidden border-amber-900/15 bg-[#FFF4CC]/90 shadow-2xl shadow-amber-950/15 backdrop-blur-md ring-amber-900/5 dark:border-border/50 dark:bg-card/95 dark:shadow-black/40 dark:ring-foreground/10 lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-amber-900/5 p-10 dark:bg-muted lg:flex">
          <div>
            <span className="block text-4xl font-semibold tracking-[-0.06em] text-primary">{appName}</span>
            <div className="auth-hero-copy">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight">{t("login.heroTitle")}</h2>
              <p className="max-w-sm text-base leading-7 text-muted-foreground">{t("login.heroDescription")}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("login.heroFooter")}</p>
        </section>

        <div className="min-w-0">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto flex w-32 items-center justify-center">
            <span className="text-3xl font-semibold tracking-[-0.06em] text-primary">{appName}</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{t("login.title")}</CardTitle>
          <CardDescription>{t("login.description", { appName })}</CardDescription>
        </CardHeader>

        <form noValidate onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("common.emailAddress")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("common.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  className="pr-16"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  {t("login.signingIn")}
                </>
              ) : (
                t("login.signIn")
              )}
            </Button>
          </CardContent>

          <CardFooter className="justify-center border-t border-amber-900/10 pt-4 text-center text-sm text-muted-foreground dark:border-border/40">
            <span>
              {t("login.noAccount")} {" "}
              <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                {t("login.createAccount")}
              </Link>
            </span>
          </CardFooter>
        </form>
        </div>
      </Card>

      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-amber-900/15 bg-[#FFF4CC]/95 p-2 shadow-lg shadow-amber-950/10 backdrop-blur-md dark:border-border dark:bg-card/95">
        {demoAccounts.map((account) => (
          <Button
            key={account.email}
            type="button"
            variant="outline"
            size="sm"
            className="px-3"
            onClick={() => handleQuickFill(account)}
          >
            {t("login.demoAccount", { number: account.number })}
          </Button>
        ))}
      </div>
      <LanguageSelector className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6" />
    </div>
  )
}
