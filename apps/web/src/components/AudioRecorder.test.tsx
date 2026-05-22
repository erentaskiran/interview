import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AudioRecorder } from "./AudioRecorder";

const noop = () => undefined;

describe("AudioRecorder", () => {
  it("calls pause while recording", async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();

    render(
      <AudioRecorder
        state="recording"
        durationSec={12}
        onStart={noop}
        onStop={noop}
        onPause={onPause}
        onResume={noop}
        onSubmit={noop}
        onPlayback={noop}
        onReRecord={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: /pause recording/i }));

    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("calls resume while paused and preserves displayed duration", async () => {
    const user = userEvent.setup();
    const onResume = vi.fn();

    render(
      <AudioRecorder
        state="paused"
        durationSec={12}
        onStart={noop}
        onStop={noop}
        onPause={noop}
        onResume={onResume}
        onSubmit={noop}
        onPlayback={noop}
        onReRecord={noop}
      />
    );

    expect(screen.getByText(/paused/i)).toBeInTheDocument();
    expect(screen.getAllByText(/0:12/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /resume recording/i }));

    expect(onResume).toHaveBeenCalledTimes(1);
  });
});
