import type { Template, User } from "../types";
import { Button } from "../components/Button";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { TemplateCard } from "../components/TemplateCard";

type QuickInterviewPageProps = {
  user: User;
  templates: Template[];
  loading: boolean;
  error?: string | null;
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  likedTemplateIds: Set<string>;
  onStartTemplate: (templateId: string) => Promise<void>;
  onToggleLike: (templateId: string, currentlyLiked: boolean) => Promise<void>;
  onOpenTemplate: (templateId: string) => void;
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

const toneByText = (value: string): "a" | "b" | "c" | "d" | "e" => {
  const hash = value.length % 5;
  if (hash === 0) return "a";
  if (hash === 1) return "b";
  if (hash === 2) return "c";
  if (hash === 3) return "d";
  return "e";
};

export default function QuickInterviewPage({
  user,
  templates,
  loading,
  error,
  counts,
  likedTemplateIds,
  onStartTemplate,
  onToggleLike,
  onOpenTemplate,
  onRefresh,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout,
}: QuickInterviewPageProps) {
  const quickTemplate = templates[0] ?? null;

  return (
    <div className="page">
      <Sidebar
        active="quick"
        user={{ name: user.displayName, sub: user.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          title="Quick Interview"
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
        <div
          className="main main--scroll"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div className="card" style={{ padding: 20 }}>
            <div className="h2" style={{ fontWeight: 500, marginBottom: 6 }}>
              Start in one click
            </div>
            <div className="small-text" style={{ marginBottom: 14 }}>
              We pick a public template and start immediately.
            </div>
            <Button
              kind="primary"
              icon="play"
              onClick={() => {
                if (!quickTemplate) {
                  return;
                }
                void onStartTemplate(quickTemplate.id);
              }}
              disabled={!quickTemplate}
            >
              {quickTemplate ? `Start: ${quickTemplate.title}` : "No template available"}
            </Button>
          </div>

          {loading && (
            <div className="card" style={{ padding: 16 }}>
              <div className="small-text">Loading templates...</div>
            </div>
          )}

          {error && (
            <div className="card" style={{ padding: 16, borderColor: "var(--err)" }}>
              <div className="small-text" style={{ color: "var(--err)" }}>
                {error}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {templates.slice(0, 8).map((template) => {
              const liked = likedTemplateIds.has(template.id);
              return (
                <TemplateCard
                  key={template.id}
                  template={{
                    id: template.id,
                    title: template.title,
                    author: {
                      name: template.author?.displayName ?? "Unknown",
                      avatarTone: toneByText(template.author?.displayName ?? template.id),
                    },
                    category: template.category,
                    likeCount: template._count?.likes ?? 0,
                    questionRange: [3, 12],
                    isLiked: liked,
                  }}
                  onClick={() => onOpenTemplate(template.id)}
                  onLike={() => {
                    void onToggleLike(template.id, liked);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
