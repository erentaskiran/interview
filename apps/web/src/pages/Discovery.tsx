import { useMemo } from "react";
import type { User } from "../types";
import type { Template } from "../types";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { TemplateCard } from "../components/TemplateCard";
import { Wave } from "../components/Wave";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { Input } from "../components/Input";

type DiscoveryPageProps = {
  user: User;
  templates: Template[];
  likedTemplateIds: Set<string>;
  selectedCategory: string;
  search: string;
  loading: boolean;
  error?: string | null;
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
  onCreateTemplate: () => void;
  onOpenTemplate: (templateId: string) => void;
  onStartTemplate: (templateId: string) => void;
  onToggleLike: (templateId: string, currentlyLiked: boolean) => Promise<void>;
  onRetry: () => void;
  onOpenProfile: () => void;
  onOpenLiked: () => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
};

const defaultCategories = ["All", "Engineering", "Product", "Design", "Founder", "Data", "Sales"];

const initialsTone = (seed: string): "a" | "b" | "c" | "d" | "e" => {
  const idx = seed.length % 5;
  if (idx === 0) return "a";
  if (idx === 1) return "b";
  if (idx === 2) return "c";
  if (idx === 3) return "d";
  return "e";
};

const userInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function DiscoveryPage({
  user,
  templates,
  likedTemplateIds,
  selectedCategory,
  search,
  loading,
  error,
  counts,
  onCategoryChange,
  onSearchChange,
  onCreateTemplate,
  onOpenTemplate,
  onStartTemplate,
  onToggleLike,
  onRetry,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout,
}: DiscoveryPageProps) {
  const categories = useMemo(() => {
    const found = new Set<string>();
    templates.forEach((template) => {
      found.add(template.category);
    });
    return [
      "All",
      ...defaultCategories.filter((category) => category !== "All"),
      ...Array.from(found).filter((category) => !defaultCategories.includes(category)),
    ];
  }, [templates]);

  const featured = templates[0] ?? null;

  return (
    <div className="page">
      <Sidebar
        active="discover"
        user={{ name: user.displayName, sub: user.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          userInitials={userInitials(user.displayName)}
          userName={user.displayName}
          userSub={user.email}
          onOpenProfile={onOpenProfile}
          onOpenLiked={onOpenLiked}
          onOpenSessions={onOpenSessions}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        />
        <div
          className="main main--scroll"
          style={{ display: "flex", flexDirection: "column", gap: 22 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Discover · {templates.length} templates
              </div>
              <h1 className="h-display" style={{ fontSize: 32, fontWeight: 500 }}>
                Pick a rubric. <span style={{ color: "var(--acc-deep)" }}>Practice out loud.</span>
              </h1>
              <div className="body-text" style={{ maxWidth: 520, marginTop: 8 }}>
                The AI runs adaptive interviews and decides to continue or finish after each answer.
              </div>
            </div>
            <Button kind="accent" icon="plus" size="lg" onClick={onCreateTemplate}>
              New template
            </Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 10 }}>
            <Input
              value={search}
              onChange={onSearchChange}
              placeholder="Search title or description"
              icon="search"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`chip${selectedCategory === category ? " chip--ink" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => onCategoryChange(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {featured && (
            <div
              className="card card--ink"
              style={{
                padding: 22,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 18,
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <span className="eyebrow" style={{ color: "var(--acc)" }}>
                  Editor's pick
                </span>
                <div
                  className="h2"
                  style={{ color: "var(--surface)", fontWeight: 500, fontSize: 22 }}
                >
                  {featured.title}
                </div>
                <div
                  className="small-text"
                  style={{ color: "oklch(0.78 0.012 78)", maxWidth: 480 }}
                >
                  {featured.description}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, zIndex: 1 }}>
                <Button kind="accent" icon="play" onClick={() => onStartTemplate(featured.id)}>
                  Start
                </Button>
                <Button kind="ghost" icon="book" onClick={() => onOpenTemplate(featured.id)}>
                  Details
                </Button>
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 360,
                  opacity: 0.08,
                  color: "var(--surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 20,
                }}
              >
                <Wave bars={50} max={120} seed={9} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="h2" style={{ fontWeight: 500 }}>
              Templates
            </div>
            {loading && (
              <span className="micro-text" style={{ color: "var(--ink-500)" }}>
                Loading...
              </span>
            )}
            {error && (
              <span className="small-text" style={{ color: "var(--err)" }}>
                {error}
              </span>
            )}
            {(error || !loading) && (
              <button
                className="small-text"
                style={{
                  marginLeft: "auto",
                  color: "var(--ink-700)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
                onClick={onRetry}
                type="button"
              >
                Refresh <Icon name="arrow" size={12} />
              </button>
            )}
          </div>

          {!loading && templates.length === 0 && (
            <div className="card" style={{ padding: 24 }}>
              <div className="h3" style={{ marginBottom: 6 }}>
                No templates found
              </div>
              <div className="small-text">Try another category or create a template.</div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
            }}
          >
            {templates.map((template) => {
              const likes = template._count?.likes ?? 0;
              const liked = likedTemplateIds.has(template.id);

              return (
                <TemplateCard
                  key={template.id}
                  template={{
                    id: template.id,
                    title: template.title,
                    author: {
                      name: template.author?.displayName ?? "Unknown",
                      avatarTone: initialsTone(template.author?.displayName ?? template.id),
                    },
                    category: template.category,
                    likeCount: likes,
                    questionRange: [3, 12],
                    isLiked: liked,
                  }}
                  onLike={() => {
                    void onToggleLike(template.id, liked);
                  }}
                  onClick={() => onOpenTemplate(template.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
