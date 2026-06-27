import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../i18n/I18nProvider";
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  Input,
  Table,
  Tabs,
  ToastProvider
} from "./ui";

function renderWithProviders(ui: ReactElement) {
  return render(
    <I18nProvider>
      <ToastProvider>{ui}</ToastProvider>
    </I18nProvider>
  );
}

describe("UI primitives", () => {
  it("renders a usable button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderWithProviders(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("associates input labels with controls", () => {
    renderWithProviders(<Input label="Lot code" placeholder="LOT-001" />);

    expect(screen.getByLabelText("Lot code")).toHaveAttribute(
      "placeholder",
      "LOT-001"
    );
  });

  it("renders badges and tab panels", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <Badge tone="success">Online</Badge>
        <Tabs
          tabs={[
            { id: "one", label: "One", content: <p>First panel</p> },
            { id: "two", label: "Two", content: <p>Second panel</p> }
          ]}
        />
      </>
    );

    expect(screen.getByText("Online")).toBeVisible();
    expect(screen.getByText("First panel")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByText("Second panel")).toBeVisible();
  });

  it("renders dialogs, tables, and empty states", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(
      <>
        <Dialog title="Confirm release" open onClose={onClose}>
          <p>Release this lot?</p>
        </Dialog>
        <Table caption="Locale previews" rows={[["Currency", "€12.00"]]} />
        <EmptyState title="Nothing here" description="Start with a scan." />
      </>
    );

    expect(screen.getByRole("dialog", { name: "Confirm release" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Locale previews" })).toBeVisible();
    expect(screen.getByText("Nothing here")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
