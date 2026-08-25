import type React from "react"
import { useMemo } from "react"
import { CalendarDays, IdCard, Mail, User as UserIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"

export const Profile = () => {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const displayName = user?.display_name || user?.username || t("profile.fallbackName")
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const joinedDate = useMemo(() => {
    if (!user?.created_at) return "-"

    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(user.created_at))
  }, [i18n.language, user?.created_at])

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("profile.eyebrow")}</p>
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("profile.description")}</p>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={displayName} className="h-20 w-20 rounded-full object-cover ring-1 ring-border" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary ring-1 ring-primary/20">
                {avatarInitial}
              </div>
            )}
            <div>
              <CardTitle className="text-2xl font-semibold">{displayName}</CardTitle>
              <CardDescription>{user?.email || t("profile.detailsPending")}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <ProfileField icon={<IdCard className="h-4 w-4" />} label={t("profile.realName")} value={user?.real_name} />
          <ProfileField icon={<UserIcon className="h-4 w-4" />} label={t("profile.username")} value={user?.username} />
          <ProfileField icon={<Mail className="h-4 w-4" />} label={t("profile.email")} value={user?.email} />
          <ProfileField icon={<CalendarDays className="h-4 w-4" />} label={t("profile.joined")} value={joinedDate} />
        </CardContent>
      </Card>
    </div>
  )
}

interface ProfileFieldProps {
  icon: React.ReactNode
  label: string
  value?: string | null
}

const ProfileField = ({ icon, label, value }: ProfileFieldProps) => (
  <div className="rounded-lg border bg-background p-4">
    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
      {icon}
      {label}
    </div>
    <p className="break-words text-base font-medium text-foreground">{value || "-"}</p>
  </div>
)
