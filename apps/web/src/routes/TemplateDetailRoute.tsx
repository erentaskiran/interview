import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, type NavigateFunction } from "react-router-dom";
import type { ApiClient } from "../api";
import { HttpError } from "../api";
import type { Template, User } from "../types";
import TemplateDetailPage from "../pages/TemplateDetail";

type TemplateResponse = {
  template: Template;
};

const parseError = (error: unknown) =>
  error instanceof HttpError ? error.message : "Unexpected error";

export type TemplateDetailRouteProps = {
  api: ApiClient;
  user: User;
  likedTemplateIds: Set<string>;
  toggleLike: (templateId: string, currentlyLiked: boolean) => Promise<void>;
  startSession: (templateId: string, navigate: NavigateFunction) => Promise<void>;
  counts: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  onLogout: () => void;
};

export default function TemplateDetailRoute({
  api,
  user,
  likedTemplateIds,
  toggleLike,
  startSession,
  counts,
  onLogout,
}: TemplateDetailRouteProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const templateId = params.id ?? "";
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplate = useCallback(async () => {
    if (!templateId) {
      setError("Template id is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<TemplateResponse>(`/templates/${templateId}`);
      setTemplate(response.template);
    } catch (loadError) {
      setError(parseError(loadError));
    } finally {
      setLoading(false);
    }
  }, [templateId, api]);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  const isLiked = likedTemplateIds.has(templateId);

  return (
    <TemplateDetailPage
      user={user}
      template={template}
      liked={isLiked}
      loading={loading}
      error={error}
      counts={counts}
      onBack={() => navigate("/discover")}
      onOpenProfile={() => navigate(`/profile/${user.id}`)}
      onOpenLiked={() => navigate("/liked")}
      onOpenSessions={() => navigate("/sessions")}
      onOpenSettings={() => navigate("/settings")}
      onLogout={onLogout}
      onRetry={() => {
        void loadTemplate();
      }}
      onOpenAuthor={(authorId) => {
        navigate(`/profile/${authorId}`);
      }}
      onStartInterview={async () => {
        if (!templateId) {
          return;
        }
        try {
          await startSession(templateId, navigate);
        } catch (startError) {
          setError(parseError(startError));
        }
      }}
      onToggleLike={async () => {
        if (!template) {
          return;
        }
        try {
          setTemplate((previous) => {
            if (!previous) {
              return previous;
            }
            const currentLikes = previous._count?.likes ?? 0;
            return {
              ...previous,
              _count: {
                likes: Math.max(0, currentLikes + (isLiked ? -1 : 1)),
              },
            };
          });
          await toggleLike(template.id, isLiked);
        } catch (toggleError) {
          setError(parseError(toggleError));
        }
      }}
    />
  );
}
