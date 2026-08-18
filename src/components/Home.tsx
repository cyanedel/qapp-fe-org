export const Home = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Home</p>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Potero</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage your workspace and creator activity from this dashboard.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Collections</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Questions</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Members</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
        </div>
      </section>
    </div>
  )
}
