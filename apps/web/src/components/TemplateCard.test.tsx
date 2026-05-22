import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TemplateCard } from "./TemplateCard";

const template = {
  id: "template-1",
  title: "Senior Frontend Systems",
  author: { name: "Ari User" },
  category: "Engineering",
  likeCount: 4,
  questionRange: [3, 12] as [number, number],
  isLiked: false
};

describe("TemplateCard", () => {
  it("opens from mouse and keyboard without triggering like", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onLike = vi.fn();

    render(<TemplateCard template={template} onClick={onClick} onLike={onLike} />);

    const card = screen.getByRole("button", { name: /open senior frontend systems/i });
    await user.click(card);
    card.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(3);
    expect(onLike).not.toHaveBeenCalled();
  });

  it("keeps the like button separate from card navigation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onLike = vi.fn();

    render(<TemplateCard template={template} onClick={onClick} onLike={onLike} />);

    await user.click(screen.getByRole("button", { name: /like senior frontend systems/i }));

    expect(onLike).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
