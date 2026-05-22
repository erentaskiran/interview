import { useState } from "react";
import type { User } from "../types";
import { Button } from "../components/Button";
import { Field, Input } from "../components/Input";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

type TemplateCreatePayload = {
  title: string;
  category: string;
  description: string;
  systemInstruction: string;
  voiceModel: string;
};

type GeneratedTemplate = {
  title: string;
  category: string;
  description: string;
  systemInstruction: string;
};

const VOICE_OPTIONS = [
  { value: "aura-2-thalia-en", label: "Thalia" },
  { value: "aura-2-andromeda-en", label: "Andromeda" },
  { value: "aura-2-helena-en", label: "Helena" },
  { value: "aura-2-apollo-en", label: "Apollo" },
] as const;

type TemplateCreatePageProps = {
  user: User;
  loading?: boolean;
  error?: string | null;
  aiGenerating?: boolean;
  aiError?: string | null;
  counts?: {
    myTemplates?: number;
    likedTemplates?: number;
    sessions?: number;
  };
  onSubmit: (payload: TemplateCreatePayload) => Promise<void>;
  onCancel: () => void;
  onOpenProfile: () => void;
  onOpenLiked: () => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onGenerateTemplate?: (prompt: string) => Promise<GeneratedTemplate>;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function TemplateCreatePage({
  user,
  loading,
  error,
  aiGenerating,
  aiError,
  counts,
  onSubmit,
  onCancel,
  onOpenProfile,
  onOpenLiked,
  onOpenSessions,
  onOpenSettings,
  onLogout,
  onGenerateTemplate,
}: TemplateCreatePageProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [description, setDescription] = useState("");
  const [systemInstruction, setSystemInstruction] = useState("");
  const [voiceModel, setVoiceModel] = useState("aura-2-thalia-en");
  const [localError, setLocalError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [localAiError, setLocalAiError] = useState<string | null>(null);
  const [generatedPreview, setGeneratedPreview] = useState<GeneratedTemplate | null>(null);

  const activeError = localError ?? error ?? null;
  const activeAiError = localAiError ?? aiError ?? null;

  const handleCreate = async () => {
    setLocalError(null);

    if (title.trim().length < 3) {
      setLocalError("Title must be at least 3 characters.");
      return;
    }
    if (category.trim().length < 2) {
      setLocalError("Category is required.");
      return;
    }
    if (description.trim().length < 10) {
      setLocalError("Description must be at least 10 characters.");
      return;
    }
    if (systemInstruction.trim().length < 10) {
      setLocalError("System instruction must be at least 10 characters.");
      return;
    }

    await onSubmit({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      systemInstruction: systemInstruction.trim(),
      voiceModel,
    });
  };

  const handleGenerate = async () => {
    setLocalAiError(null);
    setGeneratedPreview(null);
    if (!onGenerateTemplate) {
      setLocalAiError("AI generation is not available.");
      return;
    }
    if (aiPrompt.trim().length < 10) {
      setLocalAiError("Please describe your interview in at least 10 characters.");
      return;
    }
    try {
      const generated = await onGenerateTemplate(aiPrompt.trim());
      setGeneratedPreview(generated);
    } catch {
      // Error is already handled by parent via aiError prop.
    }
  };

  const applyPreview = () => {
    if (!generatedPreview) return;
    setTitle(generatedPreview.title);
    setCategory(generatedPreview.category);
    setDescription(generatedPreview.description);
    setSystemInstruction(generatedPreview.systemInstruction);
    setGeneratedPreview(null);

    const main = document.querySelector(".main--scroll");
    if (main) {
      main.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="page">
      <Sidebar
        active="create"
        user={{ name: user.displayName, sub: user.email }}
        {...(counts ? { counts } : {})}
      />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          crumb={[{ label: "Templates", onClick: onCancel }, "Create"]}
          userInitials={initials(user.displayName)}
          userName={user.displayName}
          userSub={user.email}
          onOpenProfile={onOpenProfile}
          onOpenLiked={onOpenLiked}
          onOpenSessions={onOpenSessions}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          actions={
            <Button kind="ghost" size="sm" icon="arrowL" onClick={onCancel}>
              Back
            </Button>
          }
        />

        <div className="main main--scroll">
          <div
            style={{
              maxWidth: 880,
              marginInline: "auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div
              className="card"
              style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div className="h2" style={{ fontWeight: 500 }}>
                Template details
              </div>
              <Field label="Title">
                <Input
                  value={title}
                  onChange={setTitle}
                  placeholder="Behavioral round for senior IC engineers"
                />
              </Field>
              <Field label="Category">
                <Input value={category} onChange={setCategory} placeholder="Engineering" />
              </Field>
              <Field label="Description">
                <textarea
                  className="textarea"
                  rows={7}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explain the interview context and rubric intent."
                />
              </Field>
              <Field label="Interviewer voice">
                <select
                  className="input"
                  value={voiceModel}
                  onChange={(event) => setVoiceModel(event.target.value)}
                >
                  {VOICE_OPTIONS.map((voice) => (
                    <option key={voice.value} value={voice.value}>
                      {voice.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div
              className="card"
              style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div className="h2" style={{ fontWeight: 500 }}>
                AI system instruction
              </div>
              <Field label="Instruction">
                <textarea
                  className="textarea"
                  rows={14}
                  value={systemInstruction}
                  onChange={(event) => setSystemInstruction(event.target.value)}
                  placeholder="You are a calm interviewer..."
                />
              </Field>

              {activeError && (
                <div
                  className="card"
                  style={{
                    padding: 10,
                    borderColor: "oklch(0.85 0.1 28)",
                    background: "var(--err-soft)",
                    color: "var(--err)",
                    fontSize: 12,
                  }}
                >
                  {activeError}
                </div>
              )}

              <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                <Button kind="ghost" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  kind="primary"
                  icon="check"
                  loading={Boolean(loading)}
                  onClick={() => {
                    void handleCreate();
                  }}
                >
                  Create template
                </Button>
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                gridColumn: "1 / -1",
              }}
            >
              <div className="h2" style={{ fontWeight: 500 }}>
                Generate with AI
              </div>
              <div className="small-text" style={{ color: "var(--ink-600)", marginTop: -8 }}>
                Describe what kind of interview you want, and AI will fill in the fields above
                automatically.
              </div>
              <Field label="Your request">
                <textarea
                  className="textarea"
                  rows={4}
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  placeholder="I want a behavioral interview for senior frontend engineers focusing on leadership and conflict resolution..."
                />
              </Field>

              {activeAiError && (
                <div
                  className="card"
                  style={{
                    padding: 10,
                    borderColor: "oklch(0.85 0.1 28)",
                    background: "var(--err-soft)",
                    color: "var(--err)",
                    fontSize: 12,
                  }}
                >
                  {activeAiError}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Button
                  kind="accent"
                  icon="sparkle"
                  loading={Boolean(aiGenerating)}
                  onClick={() => {
                    void handleGenerate();
                  }}
                >
                  Generate with AI
                </Button>
              </div>

              {generatedPreview && (
                <>
                  <div className="hr" style={{ marginTop: 6 }} />
                  <div className="h3" style={{ marginTop: 4 }}>
                    AI generated preview
                  </div>
                  <div
                    className="card"
                    style={{
                      padding: 14,
                      background: "var(--surface-2)",
                      borderColor: "var(--ink-200)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div className="micro-text upper" style={{ marginBottom: 2 }}>
                        Title
                      </div>
                      <div
                        className="small-text"
                        style={{ color: "var(--ink-800)", fontWeight: 500 }}
                      >
                        {generatedPreview.title}
                      </div>
                    </div>
                    <div>
                      <div className="micro-text upper" style={{ marginBottom: 2 }}>
                        Category
                      </div>
                      <div
                        className="small-text"
                        style={{ color: "var(--ink-800)", fontWeight: 500 }}
                      >
                        {generatedPreview.category}
                      </div>
                    </div>
                    <div>
                      <div className="micro-text upper" style={{ marginBottom: 2 }}>
                        Description
                      </div>
                      <div
                        className="small-text"
                        style={{ color: "var(--ink-700)", lineHeight: 1.5 }}
                      >
                        {generatedPreview.description.length > 180
                          ? `${generatedPreview.description.slice(0, 180)}...`
                          : generatedPreview.description}
                      </div>
                    </div>
                    <div>
                      <div className="micro-text upper" style={{ marginBottom: 2 }}>
                        System instruction
                      </div>
                      <div
                        className="mono small-text"
                        style={{ color: "var(--ink-700)", lineHeight: 1.5 }}
                      >
                        {generatedPreview.systemInstruction.length > 180
                          ? `${generatedPreview.systemInstruction.slice(0, 180)}...`
                          : generatedPreview.systemInstruction}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <Button kind="primary" size="sm" icon="check" onClick={applyPreview}>
                        Apply to form
                      </Button>
                      <Button kind="ghost" size="sm" onClick={() => setGeneratedPreview(null)}>
                        Discard
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
