import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Avatar } from "./Avatar";
import { Icon, IconBtn } from "./Icon";

export type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
};

export type TopbarProps = {
  title?: string;
  crumb?: Array<string | BreadcrumbItem>;
  actions?: ReactNode;
  hideSearch?: boolean;
  userInitials?: string;
  userName?: string;
  userSub?: string;
  onSearch?: (query: string) => void;
  onDiscoverTemplates?: () => void;
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
  onSearch,
  onDiscoverTemplates,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout
}: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const submitSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
      return;
    }
    window.location.assign(`/discover?q=${encodeURIComponent(query)}`);
  };
  const openDiscover = () => {
    if (onDiscoverTemplates) {
      onDiscoverTemplates();
      return;
    }
    window.location.assign("/discover");
  };

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
          ? { id: "settings", label: "Settings", icon: "settings" as const, onClick: onOpenSettings }
          : null,
        onLogout
          ? { id: "logout", label: "Logout", icon: "close" as const, onClick: onLogout }
          : null
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
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
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
              {i > 0 && (
                <Icon name="chevronR" size={12} style={{ color: "var(--ink-400)" }} />
              )}
              {(() => {
                const item = typeof c === "string" ? { label: c } : c;
                const isCurrent = i === crumb.length - 1;
                const style = {
                  color: isCurrent ? "var(--ink-900)" : "var(--ink-500)",
                  fontWeight: isCurrent ? 500 : 400
                };
                return item.onClick && !isCurrent ? (
                  <button
                    type="button"
                    className="small-text"
                    style={{ ...style, cursor: "pointer" }}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span style={style}>{item.label}</span>
                );
              })()}
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
        <form
          className="top__search"
          style={{ marginLeft: crumb || title ? 24 : 0 }}
          onSubmit={(event) => {
            event.preventDefault();
            const query = searchValue.trim();
            if (query) {
              submitSearch(query);
            }
          }}
        >
          <Icon name="search" size={14} />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search templates..."
            aria-label="Search templates"
            style={{
              minWidth: 0,
              flex: 1,
              border: 0,
              outline: 0,
              background: "transparent",
              color: "var(--ink-800)",
              font: "inherit"
            }}
          />
          <span className="top__kbd">⌘K</span>
        </form>
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
        <div ref={bellRef} style={{ position: "relative" }}>
          <IconBtn
            name="bell"
            ariaLabel="Notifications"
            onClick={() => {
              setBellOpen((current) => !current);
            }}
          />
          {bellOpen && (
            <div className="top__menu" style={{ right: 0, width: 240 }}>
              <div className="top__menu__head">
                <div className="small-text" style={{ color: "var(--ink-800)", fontWeight: 500 }}>
                  Notifications
                </div>
                <div className="micro-text">No new alerts</div>
              </div>
              <div className="top__menu__list">
                {onOpenSessions && (
                  <button
                    type="button"
                    className="top__menu__item"
                    onClick={() => {
                      setBellOpen(false);
                      onOpenSessions();
                    }}
                  >
                    <Icon name="headset" size={14} />
                    <span>View sessions</span>
                  </button>
                )}
                <button
                  type="button"
                  className="top__menu__item"
                  onClick={() => {
                    setBellOpen(false);
                    openDiscover();
                  }}
                >
                  <Icon name="compass" size={14} />
                  <span>Discover templates</span>
                </button>
              </div>
            </div>
          )}
        </div>
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
