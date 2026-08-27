import { useEffect, useMemo, useState, type ReactNode, type SubmitEvent } from "react";
import { AlertCircle, CheckCircle2, CircleX, KeyRound, Mail, Pencil, Save, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { checkUsernameAvailability, getCurrentUser, updateEmail, updatePassword, updateProfile, updateUsername, type ProfileUpdateInput } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/useAuthStore";
type ProfileForm = Required<ProfileUpdateInput>;
type DialogName = "username" | "email" | "password" | null;
const blankProfile: ProfileForm = { display_name: "", phone_country_code: "", phone_number: "", date_of_birth: "", gender: "", profession: "", locale: "", timezone: "", registered_address: "", domicile_address: "", domicile_same_as_registered: false };
export const Profile = () => {
    const { t, i18n } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const [profile, setProfile] = useState<ProfileForm>(blankProfile);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState({ current: "", next: "" });
    const [dialog, setDialog] = useState<DialogName>(null);
    const [saving, setSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
    useEffect(() => {
        if (!user)
            return;
        setProfile({ display_name: user.display_name ?? "", phone_country_code: user.phone_country_code ?? "", phone_number: user.phone_number ?? "", date_of_birth: user.date_of_birth?.slice(0, 10) ?? "", gender: user.gender ?? "", profession: user.profession ?? "", locale: user.locale ?? "", timezone: user.timezone ?? "", registered_address: user.registered_address ?? "", domicile_address: user.domicile_address ?? "", domicile_same_as_registered: user.domicile_same_as_registered ?? false });
        setEmail(user.email);
        setUsername(user.username);
    }, [user]);
    const displayName = user?.display_name || user?.username || t("profile.fallbackName");
    const joinedDate = useMemo(() => user?.created_at ? new Intl.DateTimeFormat(i18n.language, { year: "numeric", month: "long", day: "numeric" }).format(new Date(user.created_at)) : "", [i18n.language, user?.created_at]);
    const complete = async (message: string, close = true) => { setUser(await getCurrentUser()); setSuccess(message); if (close)
        setDialog(null); };
    const submitProfile = async (event: SubmitEvent<HTMLFormElement>) => { event.preventDefault(); setSaving("profile"); setError(null); try {
        await updateProfile(profile);
        await complete("Profile details saved.", false);
    }
    catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save profile details.");
    }
    finally {
        setSaving(null);
    } };
    const submitEmail = async (event: SubmitEvent<HTMLFormElement>) => { event.preventDefault(); setSaving("email"); setError(null); try {
        await updateEmail(email);
        await complete("Email address updated.");
    }
    catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update email.");
    }
    finally {
        setSaving(null);
    } };
    const submitUsername = async (event: SubmitEvent<HTMLFormElement>) => { event.preventDefault(); setSaving("username"); setError(null); try {
        await updateUsername(username);
        await complete("Username updated.");
        setUsernameStatus("idle");
    }
    catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update username.");
    }
    finally {
        setSaving(null);
    } };
    const submitPassword = async (event: SubmitEvent<HTMLFormElement>) => { event.preventDefault(); setSaving("password"); setError(null); try {
        await updatePassword(password.current, password.next);
        setPassword({ current: "", next: "" });
        await complete("Password updated.");
    }
    catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update password.");
    }
    finally {
        setSaving(null);
    } };
    const openDialog = (name: Exclude<DialogName, null>) => { setError(null); if (name === "username") {
        setUsername(user?.username ?? "");
        setUsernameStatus("idle");
    } if (name === "email")
        setEmail(user?.email ?? ""); if (name === "password")
        setPassword({ current: "", next: "" }); setDialog(name); };
    const closeDialog = () => { setDialog(null); setUsernameStatus("idle"); setPassword({ current: "", next: "" }); };
    useEffect(() => { if (dialog !== "username" || username === user?.username || !username.trim()) {
        setUsernameStatus("idle");
        return;
    } ; setUsernameStatus("checking"); const timer = window.setTimeout(async () => { try {
        const result = await checkUsernameAvailability(username);
        setUsernameStatus(result.available ? "available" : "unavailable");
    }
    catch {
        setUsernameStatus("unavailable");
    } }, 350); return () => window.clearTimeout(timer); }, [dialog, username, user?.username]);
    const field = (
        name: Exclude<keyof ProfileForm, "domicile_same_as_registered">,
        label: string,
        type = "text",
    ) => (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                type={type}
                value={profile[name]}
                onChange={(event) =>
                    setProfile((current) => ({ ...current, [name]: event.target.value }))
                }
            />
        </div>
    );
    return(
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">{t("profile.eyebrow")}</p>
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("profile.description")}</p>
      </div>
      {error && <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4"/>{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</div>}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <CardTitle className="text-2xl">{displayName}</CardTitle>
              <CardDescription>{user?.email || t("profile.detailsPending")}</CardDescription>
              {joinedDate && <p className="mt-1 text-xs text-muted-foreground">Joined {joinedDate}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <IdentityField
            icon={<UserIcon className="h-4 w-4"/>}
            label="Username"
            value={user?.username}
            onEdit={() => openDialog("username")}/>
          <IdentityField
            icon={<Mail className="h-4 w-4"/>}
            label="Email"
            value={user?.email}
            onEdit={() => openDialog("email")}/>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.personalDetails")}</CardTitle>
          <CardDescription>{t("profile.personalDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={submitProfile}>
            <div className="grid gap-4 sm:grid-cols-2">{field("display_name", t("profile.realName"))}
              <div className="space-y-2">
                <Label>{t("profile.phone")}</Label>
                <div className="grid grid-cols-[8rem_1fr] gap-2">
                  <Input type="tel" aria-label={t("profile.countryCode")} placeholder={t("profile.countryCode")} value={profile.phone_country_code} onChange={(event) => setProfile((current) => ({ ...current, phone_country_code: event.target.value }))}/>
                  <Input type="tel" aria-label={t("profile.phoneNumber")} placeholder={t("profile.phoneNumber")} value={profile.phone_number} onChange={(event) => setProfile((current) => ({ ...current, phone_number: event.target.value }))}/>
                </div>
              </div>{field("date_of_birth", t("profile.dateOfBirth"), "date")}{field("gender", t("profile.gender"))}{field("profession", t("profile.profession"))}<div className="space-y-2"><Label>{t("profile.localeTimezone")}</Label><div className="grid grid-cols-2 gap-2"><Input aria-label={t("profile.locale")} placeholder={t("profile.locale")} value={profile.locale} onChange={(event) => setProfile((current) => ({ ...current, locale: event.target.value }))}/><Input aria-label={t("profile.timezone")} placeholder={t("profile.timezone")} value={profile.timezone} onChange={(event) => setProfile((current) => ({ ...current, timezone: event.target.value }))}/></div></div></div><div className="space-y-4 border-t pt-6"><div><h3 className="font-medium">{t("profile.addresses")}</h3><p className="text-sm text-muted-foreground">{t("profile.addressesDescription")}</p></div><Address label={t("profile.registeredAddress")} value={profile.registered_address} onChange={(value) => setProfile((current) => ({ ...current, registered_address: value }))}/><div className="space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><Label>{t("profile.domicileAddress")}</Label><label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={profile.domicile_same_as_registered} onChange={(event) => setProfile((current) => ({ ...current, domicile_same_as_registered: event.target.checked }))}/>{t("profile.sameAsRegistered")}</label></div><Address hideLabel value={profile.domicile_same_as_registered ? profile.registered_address : profile.domicile_address} disabled={profile.domicile_same_as_registered} onChange={(value) => setProfile((current) => ({ ...current, domicile_address: value }))}/>{profile.domicile_same_as_registered && <p className="text-xs text-muted-foreground">{t("profile.usingRegistered")}</p>}</div></div><div className="flex justify-between"><Button type="button" variant="outline" onClick={() => openDialog("password")}><KeyRound className="h-4 w-4"/>{t("profile.changePassword")}</Button><Button type="submit" disabled={saving !== null}>{saving === "profile" ? <Spinner className="size-4"/> : <Save className="h-4 w-4"/>}{t("profile.saveDetails")}</Button></div></form></CardContent></Card>
      <Dialog open={dialog === "username"} onOpenChange={(open) => !open && closeDialog()}><DialogContent><DialogHeader><DialogTitle>Change username</DialogTitle><DialogDescription>Lowercase letters, numbers, underscores, and hyphens; 3–32 characters.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submitUsername}><div className="relative"><Input value={username} onChange={(event) => setUsername(event.target.value)} className="pr-10"/>{usernameStatus === "checking" && <Spinner className="absolute top-2.5 right-3 size-4"/>}{usernameStatus === "available" && <CheckCircle2 className="absolute top-2.5 right-3 h-4 w-4 text-emerald-600"/>}{usernameStatus === "unavailable" && <CircleX className="absolute top-2.5 right-3 h-4 w-4 text-destructive"/>}</div><Button type="submit" disabled={saving !== null || usernameStatus !== "available"}>{saving === "username" && <Spinner className="size-4"/>}Save username</Button></form></DialogContent></Dialog>
      <Dialog open={dialog === "email"} onOpenChange={(open) => !open && closeDialog()}><DialogContent><DialogHeader><DialogTitle>Change email</DialogTitle><DialogDescription>Email changes take effect immediately; verification is not enabled yet.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submitEmail}><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)}/><Button type="submit" disabled={saving !== null}>{saving === "email" && <Spinner className="size-4"/>}Save email</Button></form></DialogContent></Dialog>
      <Dialog open={dialog === "password"} onOpenChange={(open) => !open && closeDialog()}><DialogContent><DialogHeader><DialogTitle>Change password</DialogTitle><DialogDescription>New passwords must be 12–72 bytes.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={submitPassword}><Input type="password" autoComplete="current-password" placeholder="Current password" value={password.current} onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))}/><Input type="password" autoComplete="new-password" placeholder="New password" value={password.next} onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))}/><Button type="submit" disabled={saving !== null}>{saving === "password" && <Spinner className="size-4"/>}Update password</Button></form></DialogContent></Dialog>
    </div>
    ) 
};
const IdentityField = ({ icon, label, value, onEdit }: {
    icon: ReactNode;
    label: string;
    value?: string | null;
    onEdit: () => void;
}) => <div className="rounded-lg border bg-background p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">{icon}{label}</div><div className="flex items-center justify-between gap-2"><p className="break-words text-base font-medium">{value || "-"}</p><Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${label}`} onClick={onEdit}><Pencil className="h-4 w-4"/></Button></div></div>;
const Address = ({ label, value, disabled = false, hideLabel = false, onChange }: {
    label?: string;
    value: string;
    disabled?: boolean;
    hideLabel?: boolean;
    onChange: (value: string) => void;
}) => <div className="space-y-2">{!hideLabel && <Label>{label}</Label>}<textarea rows={4} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className="flex min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 focus-visible:ring-2 focus-visible:ring-ring/30"/></div>;
