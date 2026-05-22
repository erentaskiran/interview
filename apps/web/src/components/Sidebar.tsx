import { NavLink } from "react-router-dom";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { Wordmark } from "./Wordmark";

const navGroups: {
  group?: string;
  items: {
    id: string;
    icon: import("./Icon").IconName;
    label: string;
    path: string;
    badge?: string;
  }[];
}[] = [
  {
    items: [
      { id: "discover", icon: "compass", label: "Discover", path: "/discover" },
      { id: "my", icon: "bookmark", label: "My templates", path: "/my-templates" },
      { id: "liked", icon: "heart", label: "Liked", path: "/liked" },
      { id: "sessions", icon: "headset", label: "Sessions", path: "/sessions" }
    ],
  },
  {
    group: "Practice",
    items: [
      { id: "create", icon: "plus", label: "Create template", path: "/templates/new" },
      { id: "quick", icon: "bolt", label: "Quick interview", path: "/quick-interview" },
    ],
  },
  {
    group: "Account",
    items: [
      { id: "profile", icon: "user", label: "Profile", path: "/me" },
      { id: "settings", icon: "settings", label: "Settings", path: "/settings" },
    ],
  },
];

export type SidebarProps = {
  active?: string | null;
  user?: { name: string; sub?: string };
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
};

const navBadge = (
  itemId: string,
  counts: SidebarProps["counts"] | undefined,
  fallback: string | undefined
) => {
  if (itemId === "my" && counts?.myTemplates !== undefined) {
    return `${counts.myTemplates}`;
  }
  if (itemId === "liked" && counts?.likedTemplates !== undefined) {
    return `${counts.likedTemplates}`;
  }
  if (itemId === "sessions" && counts?.sessions !== undefined) {
    return `${counts.sessions}`;
  }
  return fallback;
};

export function Sidebar({
  active = null,
  user = { name: "Unknown User", sub: "" },
  counts
}: SidebarProps) {
  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="side">
      <div className="side__brand">
        <Wordmark size={17} />
      </div>
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.group && <div className="side__group">{group.group}</div>}
          <div className="side__nav">
            {group.items.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => {
                  const shouldActive = active ? active === item.id : isActive;
                  return `side__item${shouldActive ? " is-active" : ""}`;
                }}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
                {navBadge(item.id, counts, item.badge) && (
                  <span className="badge">{navBadge(item.id, counts, item.badge)}</span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
      <NavLink className="side__user" to="/me">
        <Avatar name={initials || "U"} tone="a" />
        <div style={{ minWidth: 0 }}>
          <div className="side__user__name">{user.name}</div>
          <div className="side__user__hint">{user.sub || "AInterview"}</div>
        </div>
        <Icon name="chevron" size={14} style={{ marginLeft: "auto", color: "var(--ink-500)" }} />
      </NavLink>
    </aside>
  );
}
