import type { User } from "../types";
import { Button } from "../components/Button";
import { Field, Input } from "../components/Input";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

type SettingsPageProps = {
  user: User;
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  onOpenProfile: () => void;
  onOpenLiked: () => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function SettingsPage({
  user,
  counts,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout
}: SettingsPageProps) {
  return (
    <div className="page">
      <Sidebar
        active="settings"
        user={{ name: user.displayName, sub: user.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          title="Settings"
          userInitials={initials(user.displayName)}
          userName={user.displayName}
          userSub={user.email}
          onOpenProfile={onOpenProfile}
          onOpenLiked={onOpenLiked}
          onOpenSessions={onOpenSessions}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        />
        <div className="main main--scroll">
          <div
            style={{
              maxWidth: 820,
              marginInline: "auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16
            }}
          >
            <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="h2" style={{ fontWeight: 500 }}>
                Account
              </div>
              <Field label="Display name">
                <Input value={user.displayName} disabled />
              </Field>
              <Field label="Email">
                <Input value={user.email} disabled />
              </Field>
              <div className="small-text">
                Profile editing will be added in the next iteration.
              </div>
            </div>
            <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="h2" style={{ fontWeight: 500 }}>
                Session Defaults
              </div>
              <Field label="Question range">
                <Input value="3 - 12 (backend enforced)" disabled />
              </Field>
              <Field label="Audio submission limit">
                <Input value="Up to 50MB request size" disabled />
              </Field>
              <Button kind="ghost" icon="close" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
