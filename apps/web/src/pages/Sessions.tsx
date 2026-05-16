import type { Session, User } from "../types";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

type SessionsPageProps = {
  user: User;
  sessions: Session[];
  loading: boolean;
  error?: string | null;
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  onOpenSession: (sessionId: string) => void;
  onRefresh: () => void;
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

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

const statusChipKind = (status: Session["status"]) => {
  if (status === "completed") {
    return "ok";
  }
  if (status === "failed") {
    return "ink";
  }
  return undefined;
};

export default function SessionsPage({
  user,
  sessions,
  loading,
  error,
  counts,
  onOpenSession,
  onRefresh,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout
}: SessionsPageProps) {
  return (
    <div className="page">
      <Sidebar
        active="sessions"
        user={{ name: user.displayName, sub: user.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          title="My Sessions"
          userInitials={initials(user.displayName)}
          userName={user.displayName}
          userSub={user.email}
          onOpenProfile={onOpenProfile}
          onOpenLiked={onOpenLiked}
          onOpenSessions={onOpenSessions}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          actions={
            <Button kind="ghost" size="sm" icon="arrowU" onClick={onRefresh}>
              Refresh
            </Button>
          }
        />

        <div className="main main--scroll" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && (
            <div className="card" style={{ padding: 16 }}>
              <div className="small-text">Loading sessions...</div>
            </div>
          )}

          {error && (
            <div className="card" style={{ padding: 16, borderColor: "var(--err)" }}>
              <div className="small-text" style={{ color: "var(--err)" }}>
                {error}
              </div>
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div className="h3" style={{ marginBottom: 6 }}>
                No sessions yet
              </div>
              <div className="small-text">Start a quick interview from Discover.</div>
            </div>
          )}

          {sessions.map((session) => {
            const templateTitle =
              typeof session.template === "object" && session.template
                ? ("title" in session.template ? session.template.title : "Template")
                : "Template";
            const templateCategory =
              typeof session.template === "object" && session.template
                ? ("category" in session.template ? session.template.category : "")
                : "";
            return (
              <div
                key={session.id}
                className="card"
                style={{
                  padding: 14,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "center"
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="h3" style={{ fontWeight: 500 }}>
                    {templateTitle}
                  </div>
                  <div
                    className="small-text"
                    style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>{templateCategory}</span>
                    <span>·</span>
                    <span>{formatDateTime(session.createdAt)}</span>
                    <span>·</span>
                    <span>{session._count?.turns ?? session.turns?.length ?? 0} turns</span>
                  </div>
                  <div style={{ marginTop: 8, display: "inline-flex", gap: 8 }}>
                    <Chip kind={statusChipKind(session.status)} dot>
                      {session.status}
                    </Chip>
                    {session.completionReason && <Chip dot>{session.completionReason}</Chip>}
                    {session.score !== null && <Chip dot>Score {session.score}</Chip>}
                  </div>
                </div>
                <Button kind="primary" size="sm" onClick={() => onOpenSession(session.id)}>
                  Open
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
