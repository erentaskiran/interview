import type { User, Template } from "../types";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { TemplateCard } from "../components/TemplateCard";

export type ProfileResponse = {
  user: {
    id: string;
    displayName: string;
    createdAt: string;
    _count: {
      followers: number;
      following: number;
      templates: number;
    };
  };
  templates: Template[];
  likedTemplates: Template[];
  viewer?: {
    isSelf: boolean;
    isFollowing: boolean;
  };
};

type ProfileTab = "templates" | "liked" | "sessions";

type ProfilePageProps = {
  viewer: User;
  profile: ProfileResponse | null;
  loading: boolean;
  error?: string | null;
  isFollowing: boolean;
  activeTab: ProfileTab;
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  onTabChange: (tab: ProfileTab) => void;
  onToggleFollow: () => Promise<void>;
  onOpenTemplate: (templateId: string) => void;
  onRetry: () => void;
  onOpenProfile: () => void;
  onOpenLiked: () => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onLikeToggle: (templateId: string, currentlyLiked: boolean) => Promise<void>;
  likedTemplateIds: Set<string>;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

export default function ProfilePage({
  viewer,
  profile,
  loading,
  error,
  isFollowing,
  activeTab,
  counts,
  onTabChange,
  onToggleFollow,
  onOpenTemplate,
  onRetry,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout,
  onLikeToggle,
  likedTemplateIds
}: ProfilePageProps) {
  const isSelf = profile?.user.id === viewer.id;
  const templates =
    activeTab === "liked"
      ? (profile?.likedTemplates ?? [])
      : activeTab === "templates"
        ? (profile?.templates ?? [])
        : [];

  return (
    <div className="page">
      <Sidebar
        active="profile"
        user={{ name: viewer.displayName, sub: viewer.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          crumb={["Profile", profile?.user.displayName ?? "User"]}
          userInitials={initials(viewer.displayName)}
          userName={viewer.displayName}
          userSub={viewer.email}
          onOpenProfile={onOpenProfile}
          onOpenLiked={onOpenLiked}
          onOpenSessions={onOpenSessions}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        />

        <div className="main main--scroll" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {loading && (
            <div className="card" style={{ padding: 16 }}>
              <div className="small-text">Loading profile...</div>
            </div>
          )}

          {error && (
            <div className="card" style={{ padding: 16, borderColor: "var(--err)" }}>
              <div className="small-text" style={{ color: "var(--err)" }}>
                {error}
              </div>
              <Button kind="ghost" size="sm" onClick={onRetry} style={{ marginTop: 10 }}>
                Retry
              </Button>
            </div>
          )}

          {profile && (
            <>
              <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar name={initials(profile.user.displayName)} size="xl" tone="a" />
                <div style={{ minWidth: 0 }}>
                  <div className="h2" style={{ fontWeight: 500 }}>
                    {profile.user.displayName}
                  </div>
                  <div className="small-text">
                    Joined {formatDate(profile.user.createdAt)}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <Chip dot>Templates {profile.user._count.templates}</Chip>
                    <Chip dot>Followers {profile.user._count.followers}</Chip>
                    <Chip dot>Following {profile.user._count.following}</Chip>
                  </div>
                </div>
                {!isSelf && (
                  <Button
                    kind={isFollowing ? "ghost" : "primary"}
                    icon={isFollowing ? "check" : "plus"}
                    style={{ marginLeft: "auto" }}
                    onClick={() => {
                      void onToggleFollow();
                    }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>

              <div style={{ display: "inline-flex", gap: 8, alignSelf: "flex-start" }}>
                <button
                  className={`chip${activeTab === "templates" ? " chip--ink" : ""}`}
                  type="button"
                  onClick={() => onTabChange("templates")}
                >
                  Templates
                </button>
                <button
                  className={`chip${activeTab === "liked" ? " chip--ink" : ""}`}
                  type="button"
                  onClick={() => onTabChange("liked")}
                >
                  Liked
                </button>
                <button
                  className={`chip${activeTab === "sessions" ? " chip--ink" : ""}`}
                  type="button"
                  onClick={() => onTabChange("sessions")}
                >
                  Sessions
                </button>
              </div>

              {activeTab === "sessions" && (
                <div className="card" style={{ padding: 16 }}>
                  <div className="small-text">
                    Session history endpoint is not available in this MVP backend yet.
                  </div>
                </div>
              )}

              {activeTab !== "sessions" && templates.length === 0 && (
                <div className="card" style={{ padding: 16 }}>
                  <div className="small-text">No templates in this tab.</div>
                </div>
              )}

              {activeTab !== "sessions" && templates.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 14
                  }}
                >
                  {templates.map((template) => {
                    const liked = likedTemplateIds.has(template.id);
                    return (
                      <TemplateCard
                        key={template.id}
                        template={{
                          id: template.id,
                          title: template.title,
                          author: {
                            name: template.author?.displayName ?? profile.user.displayName
                          },
                          category: template.category,
                          likeCount: template._count?.likes ?? 0,
                          questionRange: [3, 12],
                          isLiked: liked
                        }}
                        onClick={() => onOpenTemplate(template.id)}
                        onLike={() => {
                          void onLikeToggle(template.id, liked);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
