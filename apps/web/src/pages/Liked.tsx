import type { Template, User } from "../types";
import { Button } from "../components/Button";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { TemplateCard } from "../components/TemplateCard";

type LikedPageProps = {
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
  onOpenTemplate: (templateId: string) => void;
  onToggleLike: (templateId: string, currentlyLiked: boolean) => Promise<void>;
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

export default function LikedPage({
  user,
  templates,
  loading,
  error,
  counts,
  likedTemplateIds,
  onOpenTemplate,
  onToggleLike,
  onRefresh,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout
}: LikedPageProps) {
  return (
    <div className="page">
      <Sidebar
        active="liked"
        user={{ name: user.displayName, sub: user.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          title="Liked Templates"
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
              <div className="small-text">Loading liked templates...</div>
            </div>
          )}

          {error && (
            <div className="card" style={{ padding: 16, borderColor: "var(--err)" }}>
              <div className="small-text" style={{ color: "var(--err)" }}>
                {error}
              </div>
            </div>
          )}

          {!loading && templates.length === 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div className="h3" style={{ marginBottom: 6 }}>
                No liked templates
              </div>
              <div className="small-text">Like templates from Discover to collect them here.</div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {templates.map((template) => {
              const liked = likedTemplateIds.has(template.id);
              return (
                <TemplateCard
                  key={template.id}
                  template={{
                    id: template.id,
                    title: template.title,
                    author: {
                      name: template.author?.displayName ?? "Unknown",
                      avatarTone: toneByText(template.author?.displayName ?? template.id)
                    },
                    category: template.category,
                    likeCount: template._count?.likes ?? 0,
                    questionRange: [3, 12],
                    isLiked: liked
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
