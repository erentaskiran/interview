import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  type NavigateFunction,
} from "react-router-dom";
import { createApiClient, HttpError } from "./api";
import type { Session, SessionTurn, Template, TtsPayload, User } from "./types";
import AuthPage from "./pages/Auth";
import DiscoveryPage from "./pages/Discovery";
import LikedPage from "./pages/Liked";
import ProfilePage, { type ProfileResponse } from "./pages/Profile";
import QuickInterviewPage from "./pages/QuickInterview";
import SessionPage from "./pages/Session";
import SessionsPage from "./pages/Sessions";
import SettingsPage from "./pages/Settings";
import TemplateCreatePage from "./pages/TemplateCreate";
import TemplateDetailPage from "./pages/TemplateDetail";

const TOKEN_KEY = "ainterview_token";

type AuthResponse = {
  token: string;
  user: User;
};

type MeResponse = {
  user: User;
};

type TemplatesResponse = {
  templates: Template[];
};

type TemplateResponse = {
  template: Template;
};

type ProfileApiResponse = ProfileResponse;

type StartSessionResponse = {
  session: Session;
  firstQuestionAudio?: TtsPayload;
};

type AnswerSessionResponse = {
  session: Session;
  transition: "continued" | "finished_by_ai" | "finished_max_guard";
  nextTurn?: SessionTurn;
  nextQuestionAudio?: TtsPayload;
};

type FinishSessionResponse = {
  session: Session;
};

type SessionResponse = {
  session: Session;
};

type QuestionAudioResponse = {
  turnId: string;
  turnIndex: number;
  audio: TtsPayload;
};

type SessionsResponse = {
  sessions: Session[];
  totalCount: number;
};

type GenerateTemplateResponse = {
  title: string;
  category: string;
  description: string;
  systemInstruction: string;
};

const parseError = (error: unknown) =>
  error instanceof HttpError ? error.message : "Unexpected error";

const areSetsEqual = (a: Set<string>, b: Set<string>) => {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
};

const safeTab = (value: string | null): "templates" | "liked" | "sessions" => {
  if (value === "liked" || value === "sessions") {
    return value;
  }
  return "templates";
};

export default function App() {
  const api = useMemo(() => createApiClient(), []);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [likedTemplateIds, setLikedTemplateIds] = useState<Set<string>>(new Set());
  const [sidebarCounts, setSidebarCounts] = useState({
    myTemplates: 0,
    likedTemplates: 0,
  });
  const [sessionCount, setSessionCount] = useState(0);
  const [questionAudioBySessionTurn, setQuestionAudioBySessionTurn] = useState<
    Record<string, Record<number, TtsPayload>>
  >({});

  const counts = useMemo(
    () => ({
      myTemplates: sidebarCounts.myTemplates,
      likedTemplates: sidebarCounts.likedTemplates,
      sessions: sessionCount,
    }),
    [sessionCount, sidebarCounts]
  );

  useEffect(() => {
    api.setToken(token);
  }, [api, token]);

  const setLikedIdsIfChanged = useCallback((ids: string[]) => {
    const next = new Set(ids);
    setLikedTemplateIds((previous) => (areSetsEqual(previous, next) ? previous : next));
  }, []);

  const setSidebarCountsIfChanged = useCallback(
    (next: { myTemplates: number; likedTemplates: number }) => {
      setSidebarCounts((previous) => {
        if (
          previous.myTemplates === next.myTemplates &&
          previous.likedTemplates === next.likedTemplates
        ) {
          return previous;
        }
        return next;
      });
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthError(null);
    setLikedTemplateIds(new Set());
    setSidebarCounts({ myTemplates: 0, likedTemplates: 0 });
    setSessionCount(0);
    setQuestionAudioBySessionTurn({});
    setStartingInterview(false);
    localStorage.removeItem(TOKEN_KEY);
    api.setToken(null);
  }, [api]);

  const refreshViewerData = useCallback(
    async (viewerId: string) => {
      try {
        const [profile, sessions] = await Promise.all([
          api.get<ProfileApiResponse>(`/users/${viewerId}/profile`),
          api.get<SessionsResponse>("/sessions?limit=1"),
        ]);
        setLikedIdsIfChanged(profile.likedTemplates.map((template) => template.id));
        setSidebarCountsIfChanged({
          myTemplates: profile.templates.length,
          likedTemplates: profile.likedTemplates.length,
        });
        setSessionCount(sessions.totalCount);
      } catch {
        // Keep current state when refresh fails.
      }
    },
    [api, setLikedIdsIfChanged, setSidebarCountsIfChanged]
  );

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setBootLoading(false);
        return;
      }

      try {
        const response = await api.get<MeResponse>("/auth/me");
        setUser(response.user);
        await refreshViewerData(response.user.id);
      } catch {
        logout();
      } finally {
        setBootLoading(false);
      }
    };

    void bootstrap();
  }, [api, logout, refreshViewerData, token]);

  const authenticate = useCallback(
    async (
      mode: "login" | "register",
      payload: { email: string; password: string; displayName?: string }
    ) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const path = mode === "login" ? "/auth/login" : "/auth/register";
        const response = await api.post<AuthResponse>(path, payload);
        setToken(response.token);
        localStorage.setItem(TOKEN_KEY, response.token);
        setUser(response.user);
        await refreshViewerData(response.user.id);
        return true;
      } catch (error) {
        setAuthError(parseError(error));
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    [api, refreshViewerData]
  );

  const toggleLike = useCallback(
    async (templateId: string, currentlyLiked: boolean) => {
      if (!user) {
        return;
      }

      if (currentlyLiked) {
        await api.del<{ success: boolean }>(`/templates/${templateId}/like`);
      } else {
        await api.post<{ success: boolean }>(`/templates/${templateId}/like`);
      }

      setLikedTemplateIds((previous) => {
        const next = new Set(previous);
        if (currentlyLiked) {
          next.delete(templateId);
        } else {
          next.add(templateId);
        }
        return next;
      });

      await refreshViewerData(user.id);
    },
    [api, refreshViewerData, user]
  );

  const startSession = useCallback(
    async (templateId: string, navigate: NavigateFunction) => {
      setStartingInterview(true);
      try {
        const started = await api.post<StartSessionResponse>("/sessions", { templateId });
        setSessionCount((current) => current + 1);
        const firstQuestionAudio = started.firstQuestionAudio;
        if (firstQuestionAudio) {
          setQuestionAudioBySessionTurn((previous) => ({
            ...previous,
            [started.session.id]: {
              ...(previous[started.session.id] ?? {}),
              1: firstQuestionAudio,
            },
          }));
        }
        navigate(`/sessions/${started.session.id}`);
      } finally {
        setStartingInterview(false);
      }
    },
    [api]
  );

  const menuActions = useCallback(
    (navigate: NavigateFunction) => ({
      onOpenProfile: () => {
        if (!user) return;
        navigate(`/profile/${user.id}`);
      },
      onOpenLiked: () => navigate("/liked"),
      onOpenSessions: () => navigate("/sessions"),
      onOpenSettings: () => navigate("/settings"),
      onLogout: logout,
    }),
    [logout, user]
  );

  if (bootLoading || startingInterview) {
    return (
      <div className="page page--bare">
        <div
          style={{
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div className="h3" style={{ fontWeight: 500 }}>
            {startingInterview ? "Starting interview..." : "Loading..."}
          </div>
          <div className="small-text">
            {startingInterview ? "Please wait" : "Preparing your workspace"}
          </div>
        </div>
      </div>
    );
  }

  const AuthRoute = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.pathname === "/register" ? "register" : "login";

    return (
      <AuthPage
        mode={mode}
        loading={authLoading}
        error={authError}
        onModeChange={(nextMode) => {
          navigate(nextMode === "register" ? "/register" : "/login");
        }}
        onSubmit={async (submitMode, payload) => {
          const ok = await authenticate(submitMode, payload);
          if (ok) {
            navigate("/discover", { replace: true });
          }
        }}
      />
    );
  };

  if (!user || !token) {
    return (
      <Routes>
        <Route path="/login" element={<AuthRoute />} />
        <Route path="/register" element={<AuthRoute />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const DiscoverRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");

    const loadTemplates = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }
        if (search.trim()) {
          params.set("q", search.trim());
        }
        const path = params.size > 0 ? `/templates?${params.toString()}` : "/templates";
        const response = await api.get<TemplatesResponse>(path);
        setTemplates(response.templates);
      } catch (loadError) {
        setError(parseError(loadError));
      } finally {
        setLoading(false);
      }
    }, [search, selectedCategory]);

    useEffect(() => {
      void loadTemplates();
    }, [loadTemplates]);

    return (
      <DiscoveryPage
        user={user}
        templates={templates}
        likedTemplateIds={likedTemplateIds}
        selectedCategory={selectedCategory}
        search={search}
        loading={loading}
        error={error}
        counts={counts}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearch}
        onCreateTemplate={() => navigate("/templates/new")}
        onOpenTemplate={(templateId) => navigate(`/templates/${templateId}`)}
        onStartTemplate={async (templateId) => {
          try {
            await startSession(templateId, navigate);
          } catch (startError) {
            setError(parseError(startError));
          }
        }}
        onToggleLike={async (templateId, currentlyLiked) => {
          try {
            await toggleLike(templateId, currentlyLiked);
            setTemplates((previous) =>
              previous.map((template) => {
                if (template.id !== templateId) {
                  return template;
                }
                const currentLikes = template._count?.likes ?? 0;
                return {
                  ...template,
                  _count: {
                    likes: Math.max(0, currentLikes + (currentlyLiked ? -1 : 1)),
                  },
                };
              })
            );
          } catch (toggleError) {
            setError(parseError(toggleError));
          }
        }}
        onRetry={() => {
          void loadTemplates();
        }}
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
      />
    );
  };

  const QuickInterviewRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTemplates = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<TemplatesResponse>("/templates");
        setTemplates(response.templates);
      } catch (loadError) {
        setError(parseError(loadError));
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      void loadTemplates();
    }, [loadTemplates]);

    return (
      <QuickInterviewPage
        user={user}
        templates={templates}
        loading={loading}
        error={error}
        counts={counts}
        likedTemplateIds={likedTemplateIds}
        onStartTemplate={async (templateId) => {
          try {
            await startSession(templateId, navigate);
          } catch (startError) {
            setError(parseError(startError));
          }
        }}
        onToggleLike={async (templateId, currentlyLiked) => {
          try {
            await toggleLike(templateId, currentlyLiked);
            setTemplates((previous) =>
              previous.map((template) =>
                template.id === templateId
                  ? {
                      ...template,
                      _count: {
                        likes: Math.max(
                          0,
                          (template._count?.likes ?? 0) + (currentlyLiked ? -1 : 1)
                        ),
                      },
                    }
                  : template
              )
            );
          } catch (toggleError) {
            setError(parseError(toggleError));
          }
        }}
        onOpenTemplate={(templateId) => navigate(`/templates/${templateId}`)}
        onRefresh={() => {
          void loadTemplates();
        }}
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
      />
    );
  };

  const LikedRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadLiked = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await api.get<ProfileApiResponse>(`/users/${user.id}/profile`);
        setTemplates(profile.likedTemplates);
        setLikedIdsIfChanged(profile.likedTemplates.map((template) => template.id));
        setSidebarCountsIfChanged({
          myTemplates: profile.templates.length,
          likedTemplates: profile.likedTemplates.length,
        });
      } catch (loadError) {
        setError(parseError(loadError));
      } finally {
        setLoading(false);
      }
    }, [setLikedIdsIfChanged, setSidebarCountsIfChanged]);

    useEffect(() => {
      void loadLiked();
    }, [loadLiked]);

    return (
      <LikedPage
        user={user}
        templates={templates}
        loading={loading}
        error={error}
        counts={counts}
        likedTemplateIds={likedTemplateIds}
        onOpenTemplate={(templateId) => navigate(`/templates/${templateId}`)}
        onToggleLike={async (templateId, currentlyLiked) => {
          try {
            await toggleLike(templateId, currentlyLiked);
            setTemplates((previous) => previous.filter((template) => template.id !== templateId));
          } catch (toggleError) {
            setError(parseError(toggleError));
          }
        }}
        onRefresh={() => {
          void loadLiked();
        }}
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
      />
    );
  };

  const SessionsRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSessions = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<SessionsResponse>("/sessions?limit=100");
        setSessions(response.sessions);
        setSessionCount(response.totalCount);
      } catch (loadError) {
        setError(parseError(loadError));
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      void loadSessions();
    }, [loadSessions]);

    return (
      <SessionsPage
        user={user}
        sessions={sessions}
        loading={loading}
        error={error}
        counts={counts}
        onOpenSession={(sessionId) => navigate(`/sessions/${sessionId}`)}
        onRefresh={() => {
          void loadSessions();
        }}
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
      />
    );
  };

  const SettingsRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
    return (
      <SettingsPage
        user={user}
        counts={counts}
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
      />
    );
  };

  const TemplateCreateRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    return (
      <TemplateCreatePage
        user={user}
        loading={loading}
        error={error}
        aiGenerating={aiGenerating}
        aiError={aiError}
        counts={counts}
        onCancel={() => navigate("/discover")}
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
        onSubmit={async (payload) => {
          setLoading(true);
          setError(null);
          try {
            const created = await api.post<Template>("/templates", payload);
            await refreshViewerData(user.id);
            navigate(`/templates/${created.id}`);
          } catch (createError) {
            setError(parseError(createError));
          } finally {
            setLoading(false);
          }
        }}
        onGenerateTemplate={async (prompt) => {
          setAiGenerating(true);
          setAiError(null);
          try {
            const generated = await api.post<GenerateTemplateResponse>("/templates/generate", {
              prompt,
            });
            return generated;
          } catch (generateError) {
            setAiError(parseError(generateError));
            throw generateError;
          } finally {
            setAiGenerating(false);
          }
        }}
      />
    );
  };

  const TemplateDetailRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
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
    }, [templateId]);

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
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
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
            await toggleLike(template.id, isLiked);
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
          } catch (toggleError) {
            setError(parseError(toggleError));
          }
        }}
      />
    );
  };

  const ProfileRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
    const params = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const profileId = params.id ?? "";
    const activeTab = safeTab(searchParams.get("tab"));
    const [profile, setProfile] = useState<ProfileApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);

    const loadProfile = useCallback(async () => {
      if (!profileId) {
        setError("User id is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.get<ProfileApiResponse>(`/users/${profileId}/profile`);
        setProfile(response);
        setIsFollowing(response.viewer?.isFollowing ?? false);
      } catch (loadError) {
        setError(parseError(loadError));
      } finally {
        setLoading(false);
      }
    }, [profileId]);

    useEffect(() => {
      void loadProfile();
    }, [loadProfile]);

    return (
      <ProfilePage
        viewer={user}
        profile={profile}
        loading={loading}
        error={error}
        isFollowing={isFollowing}
        activeTab={activeTab}
        counts={counts}
        likedTemplateIds={likedTemplateIds}
        onTabChange={(tab) => {
          const next = new URLSearchParams(searchParams);
          next.set("tab", tab);
          setSearchParams(next);
        }}
        onRetry={() => {
          void loadProfile();
        }}
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
        onOpenTemplate={(templateId) => navigate(`/templates/${templateId}`)}
        onLikeToggle={async (templateId, currentlyLiked) => {
          try {
            await toggleLike(templateId, currentlyLiked);
            setProfile((previous) => {
              if (!previous) {
                return previous;
              }
              const updateTemplate = (template: Template) => {
                if (template.id !== templateId) {
                  return template;
                }
                const likes = template._count?.likes ?? 0;
                return {
                  ...template,
                  _count: {
                    likes: Math.max(0, likes + (currentlyLiked ? -1 : 1)),
                  },
                };
              };
              return {
                ...previous,
                templates: previous.templates.map(updateTemplate),
                likedTemplates: previous.likedTemplates.map(updateTemplate),
              };
            });
          } catch (toggleError) {
            setError(parseError(toggleError));
          }
        }}
        onToggleFollow={async () => {
          if (!profile || profile.user.id === user.id) {
            return;
          }
          try {
            if (isFollowing) {
              await api.del<{ success: boolean }>(`/users/${profile.user.id}/follow`);
              setIsFollowing(false);
              setProfile((previous) =>
                previous
                  ? {
                      ...previous,
                      user: {
                        ...previous.user,
                        _count: {
                          ...previous.user._count,
                          followers: Math.max(0, previous.user._count.followers - 1),
                        },
                      },
                    }
                  : previous
              );
            } else {
              await api.post<{ success: boolean }>(`/users/${profile.user.id}/follow`);
              setIsFollowing(true);
              setProfile((previous) =>
                previous
                  ? {
                      ...previous,
                      user: {
                        ...previous.user,
                        _count: {
                          ...previous.user._count,
                          followers: previous.user._count.followers + 1,
                        },
                      },
                    }
                  : previous
              );
            }
          } catch (followError) {
            setError(parseError(followError));
          }
        }}
      />
    );
  };

  const SessionDetailRoute = () => {
    const navigate = useNavigate();
    const menu = menuActions(navigate);
    const params = useParams<{ id: string }>();
    const sessionId = params.id ?? "";
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSession = useCallback(async () => {
      if (!sessionId) {
        setError("Session id is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.get<SessionResponse>(`/sessions/${sessionId}`);
        setSession(response.session);
      } catch (loadError) {
        setError(parseError(loadError));
      } finally {
        setLoading(false);
      }
    }, [sessionId]);

    useEffect(() => {
      void loadSession();
    }, [loadSession]);

    return (
      <SessionPage
        user={user}
        session={session}
        loading={loading}
        busy={busy}
        error={error}
        counts={counts}
        firstQuestionAudio={questionAudioBySessionTurn[sessionId]?.[1] ?? null}
        questionAudioByTurn={questionAudioBySessionTurn[sessionId] ?? {}}
        onRefresh={async () => {
          await loadSession();
        }}
        onOpenProfile={menu.onOpenProfile}
        onOpenLiked={menu.onOpenLiked}
        onOpenSessions={menu.onOpenSessions}
        onOpenSettings={menu.onOpenSettings}
        onLogout={menu.onLogout}
        onOpenTemplate={() => {
          if (session?.templateId) {
            navigate(`/templates/${session.templateId}`);
          }
        }}
        onLoadQuestionAudio={async (turnIndex) => {
          if (!sessionId) {
            return null;
          }
          try {
            const response = await api.get<QuestionAudioResponse>(
              `/sessions/${sessionId}/question-audio?turnIndex=${turnIndex}`
            );
            setQuestionAudioBySessionTurn((previous) => ({
              ...previous,
              [sessionId]: {
                ...(previous[sessionId] ?? {}),
                [response.turnIndex]: response.audio,
              },
            }));
            return response.audio;
          } catch {
            return null;
          }
        }}
        onManualFinish={async () => {
          if (!sessionId) {
            return;
          }
          setBusy(true);
          setError(null);
          try {
            const finished = await api.post<FinishSessionResponse>(`/sessions/${sessionId}/finish`);
            setSession(finished.session);
          } catch (finishError) {
            setError(parseError(finishError));
          } finally {
            setBusy(false);
          }
        }}
        onSubmitAnswer={async (payload) => {
          if (!sessionId) {
            return;
          }
          setBusy(true);
          setError(null);
          try {
            const updated = await api.post<AnswerSessionResponse>(
              `/sessions/${sessionId}/answer`,
              payload
            );
            setSession(updated.session);
            if (
              updated.transition === "continued" &&
              updated.nextTurn &&
              updated.nextQuestionAudio
            ) {
              const nextTurn = updated.nextTurn;
              const nextQuestionAudio = updated.nextQuestionAudio;
              setQuestionAudioBySessionTurn((previous) => ({
                ...previous,
                [sessionId]: {
                  ...(previous[sessionId] ?? {}),
                  [nextTurn.turnIndex]: nextQuestionAudio,
                },
              }));
            }
          } catch (submitError) {
            setError(parseError(submitError));
            throw submitError;
          } finally {
            setBusy(false);
          }
        }}
        onRetryFromTemplate={async () => {
          if (!session?.templateId) {
            return;
          }
          setError(null);
          try {
            await startSession(session.templateId, navigate);
          } catch (startError) {
            setError(parseError(startError));
          }
        }}
      />
    );
  };

  const MeRedirect = () => {
    const location = useLocation();
    return <Navigate to={`/profile/${user.id}${location.search}`} replace />;
  };

  return (
    <Routes>
      <Route path="/discover" element={<DiscoverRoute />} />
      <Route path="/quick-interview" element={<QuickInterviewRoute />} />
      <Route path="/liked" element={<LikedRoute />} />
      <Route path="/sessions" element={<SessionsRoute />} />
      <Route path="/sessions/:id" element={<SessionDetailRoute />} />
      <Route path="/settings" element={<SettingsRoute />} />
      <Route path="/templates/new" element={<TemplateCreateRoute />} />
      <Route path="/templates/:id" element={<TemplateDetailRoute />} />
      <Route path="/profile/:id" element={<ProfileRoute />} />
      <Route path="/me" element={<MeRedirect />} />
      <Route path="/login" element={<Navigate to="/discover" replace />} />
      <Route path="/register" element={<Navigate to="/discover" replace />} />
      <Route path="*" element={<Navigate to="/discover" replace />} />
    </Routes>
  );
}
