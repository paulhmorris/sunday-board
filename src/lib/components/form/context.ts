import type { RemoteFormEnhanceCallback, RemoteFormIssue } from "@sveltejs/kit";
import { nanoid } from "nanoid";
import { getContext, setContext } from "svelte";

import type { FieldController, FieldLike } from "./field.svelte";

/**
 * A remote form of any shape, described structurally by what these components actually use — spread
 * onto `<form>`, plus validation state. `RemoteForm<any, any>` can't be used here: with `any` input,
 * `fields` widens to an index-signature type that concrete field objects aren't assignable to.
 */
export interface AnyRemoteForm {
  [attachment: symbol]: (node: HTMLFormElement) => void;
  method: "POST";
  action: string;
  validate(options?: { includeUntouched?: boolean; preflightOnly?: boolean }): Promise<void>;
  /** Returns the attributes to spread in place of the form itself. See `<Form enhance={...} />`. */
  enhance(callback: RemoteFormEnhanceCallback): {
    [attachment: symbol]: (node: HTMLFormElement) => void;
    method: "POST";
    action: string;
  };
  get submitted(): boolean;
  get pending(): number;
  fields: { allIssues(): RemoteFormIssue[] | undefined };
}

export interface FormContext {
  readonly form: AnyRemoteForm;
}

export interface ControlContext {
  readonly id: string;
  readonly descriptionId: string;
  readonly errorId: string;
}

/**
 * Published by `<RadioGroup />` and `<CheckboxGroup />`. Members read the field to build their own
 * attributes, and share the group's controller so touching any member validates — and shows issues
 * for — the group as a whole.
 */
export interface FieldGroupContext {
  readonly field: FieldLike;
  readonly control: FieldController;
}

/**
 * Set by `<Fieldset />` so that touching any control inside it also touches the fieldset's own
 * controller — otherwise issues belonging to a container field (an array's "must be unique", say)
 * would stay hidden until submit, because a fieldset has no events of its own.
 */
export interface TouchSink {
  touch(): void;
}

const FORM_KEY = Symbol("form");
const CONTROL_KEY = Symbol("form-control");
const GROUP_KEY = Symbol("form-field-group");
const TOUCH_KEY = Symbol("form-touch-sink");

export function setFormContext(context: FormContext) {
  setContext(FORM_KEY, context);
}

/** Undefined when a field is used outside a `<Form />` — validation is then left to the caller. */
export function getFormContext(): FormContext | undefined {
  return getContext(FORM_KEY);
}

export function setControlContext(context: ControlContext) {
  setContext(CONTROL_KEY, context);
}

/** Undefined when a field is used outside a `<FormControl />` — it falls back to its own ids. */
export function getControlContext(): ControlContext | undefined {
  return getContext(CONTROL_KEY);
}

export function setFieldGroupContext(context: FieldGroupContext) {
  setContext(GROUP_KEY, context);
}

/** Undefined for a standalone checkbox; `<Radio />` requires it. */
export function getFieldGroupContext(): FieldGroupContext | undefined {
  return getContext(GROUP_KEY);
}

export function setTouchSink(sink: TouchSink) {
  setContext(TOUCH_KEY, sink);
}

/** The enclosing `<Fieldset />`, if any, whose controller should be touched alongside this one. */
export function getTouchSink(): TouchSink | undefined {
  return getContext(TOUCH_KEY);
}

export function createControlIds(id = `f-${nanoid(8)}`): ControlContext {
  return { id, descriptionId: `${id}-description`, errorId: `${id}-error` };
}
