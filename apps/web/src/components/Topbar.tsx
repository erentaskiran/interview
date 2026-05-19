import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { Icon, IconBtn } from "./Icon";

export type TopbarProps = {
  title?: string;
  crumb?: string[];
  actions?: ReactNode;
  hideSearch?: boolean;
  userInitials?: string;
  userName?: string;
  userSub?: string;
  onOpenProfile?: () => void;
  onOpenLiked?: () => void;
  onOpenSessions?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
};

export function Topbar({
  title,
  crumb,
  actions,
  hideSearch,
  userInitials = "AI",
  userName = "User",
  userSub = "",
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout,
}: TopbarProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const trimmed = searchQuery.trim();
        if (trimmed) {
          navigate(`/discover?q=${encodeURIComponent(trimmed)}`);
        } else {
          navigate("/discover");
        }
      }
    },
    [navigate, searchQuery]
  );

  const menuItems = useMemo(
    () =>
      [
        onOpenProfile
          ? { id: "profile", label: "Profile", icon: "user" as const, onClick: onOpenProfile }
          : null,
        onOpenLiked
          ? { id: "liked", label: "Liked", icon: "heart" as const, onClick: onOpenLiked }
          : null,
        onOpenSessions
          ? { id: "sessions", label: "Sessions", icon: "headset" as const, onClick: onOpenSessions }
          : null,
        onOpenSettings
          ? {
              id: "settings",
              label: "Settings",
              icon: "settings" as const,
              onClick: onOpenSettings,
            }
          : null,
        onLogout
          ? { id: "logout", label: "Logout", icon: "close" as const, onClick: onLogout }
          : null,
      ].filter(Boolean) as Array<{
        id: string;
        label: string;
        icon: "user" | "heart" | "headset" | "settings" | "close";
        onClick: () => void;
      }>,
    [onLogout, onOpenLiked, onOpenProfile, onOpenSessions, onOpenSettings]
  );

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="top">
      {crumb && (
        <span
          className="small-text"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {crumb.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <Icon name="chevronR" size={12} style={{ color: "var(--ink-400)" }} />}
              <span
                style={{
                  color: i === crumb.length - 1 ? "var(--ink-900)" : "var(--ink-500)",
                  fontWeight: i === crumb.length - 1 ? 500 : 400,
                }}
              >
                {c}
              </span>
            </span>
          ))}
        </span>
      )}
      {!crumb && title && (
        <span className="h3" style={{ fontWeight: 500 }}>
          {title}
        </span>
      )}
      {!hideSearch && (
        <div
          className="top__search"
          style={{ marginLeft: crumb || title ? 24 : 0 }}
          onClick={() => searchInputRef.current?.focus()}
        >
          <Icon name="search" size={14} />
          <input
            ref={searchInputRef}
            type="text"
            className="top__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search templates, prompts, people…"
          />
          <span className="top__kbd">⌘K</span>
        </div>
      )}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {actions}
        <IconBtn name="bell" />
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="top__avatarBtn"
            onClick={() => {
              if (menuItems.length < 1) {
                return;
              }
              setMenuOpen((current) => !current);
            }}
          >
            <Avatar name={userInitials} tone="a" />
            <Icon name="chevron" size={13} style={{ color: "var(--ink-500)" }} />
          </button>
          {menuOpen && menuItems.length > 0 && (
            <div className="top__menu">
              <div className="top__menu__head">
                <div className="small-text" style={{ color: "var(--ink-800)", fontWeight: 500 }}>
                  {userName}
                </div>
                {userSub && <div className="micro-text">{userSub}</div>}
              </div>
              <div className="top__menu__list">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="top__menu__item"
                    onClick={() => {
                      setMenuOpen(false);
                      item.onClick();
                    }}
                  >
                    <Icon name={item.icon} size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
