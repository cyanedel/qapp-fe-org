import { useTranslation } from "react-i18next"

export const Home = () => {
  const { t } = useTranslation()
  const appName = t("app.name")

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("home.eyebrow")}</p>
        <h1 className="text-3xl font-bold tracking-tight">{t("home.title", { appName })}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("home.description")}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{t("home.collections")}</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{t("home.questions")}</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{t("home.members")}</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
      </section>
    </div>
  )
}
