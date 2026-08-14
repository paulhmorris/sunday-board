import type { RemoteFormField } from "@sveltejs/kit";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";

import CheckboxGroup from "./checkbox-group.svelte";
import Checkbox from "./checkbox.svelte";
import FileInput from "./file-input.svelte";
import RadioGroup from "./radio-group.svelte";
import Select from "./select.svelte";
import Textarea from "./textarea.svelte";

/** The field components only use `as()` and `issues()`, so a stub is enough to render them. */
function stubField(messages: string[] = []) {
  return {
    as: (type: string, value?: unknown) => ({
      name:
        type === "select multiple" || type === "file multiple" || (type === "checkbox" && value)
          ? "answer[]"
          : "answer",
      // Kit's `as()` exposes `value` as a getter that is undefined until the field has a value
      ...(type === "select" || type === "select multiple" ? { value: undefined } : {}),
      ...(type === "select multiple" ? { multiple: true } : {}),
      ...(type === "file multiple" ? { multiple: true, type: "file" } : {}),
      ...(type === "file" ? { type: "file" } : {}),
      ...(type === "checkbox" || type === "radio" ? { checked: false, type, value } : {}),
    }),
    issues: () => (messages.length > 0 ? messages.map((message) => ({ message, path: ["answer"] })) : undefined),
  } as unknown as RemoteFormField<never>;
}

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));
const options = snippet(`<option value="drums">Drums</option>`);
const label = snippet(`<span>Subscribe</span>`);

describe("field components", () => {
  it("links a description to the control", async () => {
    render(Select, { children: options, description: "Pick your instrument", field: stubField() });

    const select = page.getByRole("combobox");
    const description = page.getByText("Pick your instrument");

    await expect.element(select).toHaveAttribute("aria-describedby", await description.element().id);
    await expect.element(page.getByRole("option", { name: "Drums" })).toBeInTheDocument();
  });

  it("hides issues until the control is touched, then links them", async () => {
    render(Select, { children: options, field: stubField(["Required"]) });

    const select = page.getByRole("combobox");
    await expect.element(select).not.toHaveAttribute("aria-invalid");

    await select.element().focus();
    (select.element() as HTMLSelectElement).blur();

    await expect.element(select).toHaveAttribute("aria-invalid", "true");
    await expect.element(page.getByText("Required")).toBeInTheDocument();
    await expect
      .element(select)
      .toHaveAttribute("aria-errormessage", page.getByText("Required").element().parentElement?.id);
  });

  it("renders a multi-select as an array field", async () => {
    render(Select, { children: options, field: stubField(), multiple: true });

    const select = page.getByRole("listbox");
    await expect.element(select).toHaveAttribute("name", "answer[]");
    await expect.element(select).toHaveAttribute("multiple");
  });

  it("keeps a placeholder option selected when the field has no value yet", async () => {
    render(Select, {
      children: snippet(
        `<optgroup label="Instruments"><option value="">Choose one</option><option value="drums">Drums</option></optgroup>`,
      ),
      field: stubField(["Required"]),
    });

    const select = page.getByRole("combobox").element() as HTMLSelectElement;
    expect(select.selectedIndex).toBe(0);

    // Any re-render used to assign the undefined value and deselect everything
    select.focus();
    select.blur();
    await expect.element(page.getByText("Required")).toBeInTheDocument();

    expect(select.selectedIndex).toBe(0);
  });

  it("renders a textarea for the field", async () => {
    render(Textarea, { field: stubField(), placeholder: "Notes" });

    await expect.element(page.getByRole("textbox")).toHaveAttribute("name", "answer");
  });

  it("renders a standalone checkbox with its own label and messages", async () => {
    render(Checkbox, { children: label, field: stubField(["Please accept"]) });

    const checkbox = page.getByRole("checkbox");
    await expect.element(checkbox).toHaveAttribute("name", "answer");
    await expect.element(page.getByText("Subscribe")).toBeInTheDocument();

    checkbox.element().dispatchEvent(new Event("change", { bubbles: true }));
    await expect.element(page.getByText("Please accept")).toBeInTheDocument();
  });

  it("renders grouped checkboxes that share the group's issues", async () => {
    render(CheckboxGroup, {
      children: snippet("<span>choices</span>"),
      field: stubField(["Pick at least one"]),
      legend: "Languages",
    });

    await expect.element(page.getByRole("group", { name: "Languages" })).toBeInTheDocument();
    await expect.element(page.getByText("Pick at least one")).not.toBeInTheDocument();
  });

  it("renders a radio group as a fieldset", async () => {
    render(RadioGroup, { children: snippet("<span>choices</span>"), field: stubField(), legend: "Operating system" });

    await expect.element(page.getByRole("group", { name: "Operating system" })).toBeInTheDocument();
  });

  it("renders a multiple file input", async () => {
    render(FileInput, { field: stubField(), multiple: true });

    // A file input has no ARIA role of its own, so query it directly.
    const element = document.querySelector('input[type="file"]') as HTMLInputElement;

    expect(element).not.toBeNull();
    expect(element.multiple).toBe(true);
    expect(element.name).toBe("answer[]");
  });
});
