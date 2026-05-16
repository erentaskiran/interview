import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { Icon } from "./Icon";

export type TemplateCardProps = {
  template: {
    id: string;
    title: string;
    author: { name: string; avatarTone?: "a" | "b" | "c" | "d" | "e" };
    category: string;
    likeCount: number;
    questionRange: [number, number];
    isLiked?: boolean;
    trending?: boolean;
  };
  onLike?: () => void;
  onClick?: () => void;
};

export function TemplateCard({ template, onLike, onClick }: TemplateCardProps) {
  const category = template.category.toLowerCase();
  const chipKind =
    category === "engineering"
      ? "accent"
      : category === "product"
        ? "ok"
      : undefined;

  const initials = template.author.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className="card"
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        cursor: "pointer",
        transition: "box-shadow 0.12s",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-xs)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Chip kind={chipKind} dot>
          {template.category}
        </Chip>
        {template.trending && (
          <span className="micro-text" style={{ color: "var(--acc-deep)" }}>
            ↑ trending
          </span>
        )}
      </div>

      <div
        style={{
          fontWeight: 500,
          fontSize: 15.5,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          textWrap: "pretty",
        }}
      >
        {template.title}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--ink-600)",
          fontSize: 12,
        }}
      >
        <Avatar name={initials} size="sm" tone={template.author.avatarTone || "b"} />
        <span>{template.author.name}</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: "auto",
          paddingTop: 6,
          borderTop: "1px solid var(--ink-100)",
        }}
      >
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-600)" }}>
          {template.questionRange[0]}–{template.questionRange[1]} Q
        </span>
        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: template.isLiked ? "var(--err)" : "var(--ink-600)",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
        >
          <Icon
            name="heart"
            size={13}
            stroke={template.isLiked ? 0 : 1.6}
            style={{ fill: template.isLiked ? "currentColor" : "none" }}
          />
          <span className="mono" style={{ fontSize: 11 }}>
            {template.likeCount}
          </span>
        </span>
      </div>
    </div>
  );
}
