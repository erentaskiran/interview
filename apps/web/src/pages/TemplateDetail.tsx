import type { User } from "../types";
import type { Template } from "../types";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Icon } from "../components/Icon";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

type TemplateDetailPageProps = {
  user: User;
  template: Template | null;
  liked: boolean;
  loading: boolean;
  error?: string | null;
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  onBack: () => void;
  onOpenCategory: (category: string) => void;
  onStartInterview: () => void;
  onToggleLike: () => void;
  onRetry: () => void;
  onOpenAuthor: (authorId: string) => void;
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

export default function TemplateDetailPage({
  user,
  template,
  liked,
  loading,
  error,
  counts,
  onBack,
  onOpenCategory,
  onStartInterview,
  onToggleLike,
  onRetry,
  onOpenAuthor,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout
}: TemplateDetailPageProps) {
  const authorName = template?.author?.displayName ?? "Unknown";
  const authorId = template?.author?.id ?? null;

  return (
    <div className="page">
      <Sidebar
        active="discover"
        user={{ name: user.displayName, sub: user.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          crumb={[
            { label: "Discover", onClick: onBack },
            template
              ? {
                  label: template.category,
                  onClick: () => onOpenCategory(template.category)
                }
              : "Template",
            template?.title ?? "Detail"
          ]}
          userInitials={initials(user.displayName)}
          userName={user.displayName}
          userSub={user.email}
          onOpenProfile={onOpenProfile}
          onOpenLiked={onOpenLiked}
          onOpenSessions={onOpenSessions}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          actions={
            <Button kind="ghost" size="sm" icon="arrowL" onClick={onBack}>
              Back
            </Button>
          }
        />

        <div
          className="main main--scroll"
          style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
            {loading && (
              <div className="card" style={{ padding: 18 }}>
                <div className="small-text">Loading template...</div>
              </div>
            )}

            {error && (
              <div className="card" style={{ padding: 18, borderColor: "var(--err)" }}>
                <div className="small-text" style={{ color: "var(--err)" }}>
                  {error}
                </div>
                <Button kind="ghost" size="sm" onClick={onRetry} style={{ marginTop: 10 }}>
                  Retry
                </Button>
              </div>
            )}

            {template && (
              <>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Chip kind="accent" dot>
                      {template.category}
                    </Chip>
                  </div>
                  <h1
                    className="h-display"
                    style={{
                      fontSize: 34,
                      fontWeight: 500,
                      textWrap: "balance"
                    }}
                  >
                    {template.title}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 14,
                      color: "var(--ink-600)"
                    }}
                  >
                    <Avatar name={initials(authorName)} tone="d" size="sm" />
                    <button
                      className="body-text"
                      style={{ color: "var(--ink-800)", cursor: "pointer" }}
                      onClick={() => {
                        if (authorId) {
                          onOpenAuthor(authorId);
                        }
                      }}
                      type="button"
                    >
                      {authorName}
                    </button>
                    <span className="micro-text">·</span>
                    <span className="micro-text">
                      {template._count?.likes ?? 0} likes
                    </span>
                  </div>
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div className="h3" style={{ marginBottom: 8 }}>
                    About this rubric
                  </div>
                  <p className="body-text">{template.description}</p>
                </div>

                <div>
                  <div className="h3" style={{ marginBottom: 12 }}>
                    System instruction
                  </div>
                  <div className="card" style={{ padding: 16, background: "var(--surface-2)" }}>
                    <p
                      className="mono"
                      style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-800)" }}
                    >
                      {template.systemInstruction}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "sticky",
              top: 0,
              alignSelf: "flex-start"
            }}
          >
            <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Adaptive session
                </div>
                <div className="h2" style={{ fontWeight: 500 }}>
                  3-12 questions
                </div>
                <div className="small-text" style={{ marginTop: 4 }}>
                  AI decides continue or finish after each answer.
                </div>
              </div>
              <div className="bar is-acc">
                <i style={{ width: "45%" }} />
              </div>
              <Button kind="primary" size="lg" block icon="play" iconRight="arrow" onClick={onStartInterview}>
                Start interview
              </Button>
              <div style={{ display: "flex", gap: 8 }}>
                <Button kind="ghost" block icon="heart" onClick={onToggleLike}>
                  {liked ? "Unlike" : "Like"} · {template?._count?.likes ?? 0}
                </Button>
                <button className="btn btn--ghost btn--icon" type="button" onClick={onRetry}>
                  <Icon name="arrowU" size={15} />
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <div className="micro-text upper" style={{ marginBottom: 10 }}>
                Author
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={initials(authorName)} tone="d" />
                <div style={{ minWidth: 0 }}>
                  <div className="h3">{authorName}</div>
                </div>
                {authorId && (
                  <Button kind="ghost" size="sm" onClick={() => onOpenAuthor(authorId)}>
                    Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
