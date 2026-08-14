import type { RemoteFormIssue } from "@sveltejs/kit";

import { createControlIds, getControlContext, getFormContext, getTouchSink } from "./context";

/**
 * A field with its `as()` widened. `AsArgs` can't resolve against a generic value type, and every
 * component ends up needing the same cast, so it lives here once.
 */
export interface FieldLike {
  as(type: string, value?: unknown): Record<string, unknown>;
  issues(): RemoteFormIssue[] | undefined;
}

export function asField(field: unknown): FieldLike {
  return field as FieldLike;
}

export type FieldController = ReturnType<typeof createField>;

export interface FieldEventHandlers<Target extends HTMLElement> {
  onblur?: ((event: FocusEvent & { currentTarget: EventTarget & Target }) => void) | null;
  onchange?: ((event: Event & { currentTarget: EventTarget & Target }) => void) | null;
  oninput?: ((event: Event & { currentTarget: EventTarget & Target }) => void) | null;
}

interface FieldOptions {
  /** The field's issues, e.g. `() => field.issues()` */
  issues: () => RemoteFormIssue[] | undefined;
  /** An explicit id from the caller, which wins over the enclosing `<FormControl />` */
  id: () => string | undefined;
  description: () => string | undefined;
}

/**
 * Shared behaviour for `<Input />`, `<Select />` and `<Textarea />`.
 *
 * SvelteKit's `validate()` is form-wide, and it ignores fields it considers untouched — so blurring a
 * field the user never typed into produces no issues at all. We therefore always validate with
 * `includeUntouched`, and track touched state per field to decide what actually gets rendered.
 */
export function createField(options: FieldOptions) {
  const formContext = getFormContext();
  const controlContext = getControlContext();
  const touchSink = getTouchSink();
  const ownIds = createControlIds();

  let touched = $state(false);

  const ids = $derived(options.id() ? createControlIds(options.id()) : (controlContext ?? ownIds));
  const issues = $derived(touched || formContext?.form.submitted ? (options.issues() ?? []) : []);
  const invalid = $derived(issues.length > 0);
  const describedBy = $derived(options.description() ? ids.descriptionId : undefined);

  function validate() {
    void formContext?.form.validate({ includeUntouched: true });
  }

  /** Touching a control also touches the fieldset around it, which owns any container-level issues. */
  function touch() {
    touched = true;
    touchSink?.touch();
  }

  return {
    /** Spread last, so it wins over the `aria-invalid` that `field.as(...)` sets unconditionally. */
    get attributes() {
      return {
        "aria-describedby": describedBy,
        "aria-errormessage": invalid ? ids.errorId : undefined,
        "aria-invalid": invalid ? ("true" as const) : undefined,
        id: ids.id,
      };
    },
    get describedBy() {
      return describedBy;
    },
    /**
     * Validation timing, spread onto the control. The caller's own handlers, if any, run after ours.
     * A field validates once it has been blurred or changed, and stays live from then on.
     */
    events<Target extends HTMLElement>(handlers: FieldEventHandlers<Target> = {}) {
      return {
        onblur: (event: FocusEvent & { currentTarget: EventTarget & Target }) => {
          touch();
          validate();
          handlers.onblur?.(event);
        },
        onchange: (event: Event & { currentTarget: EventTarget & Target }) => {
          touch();
          validate();
          handlers.onchange?.(event);
        },
        oninput: (event: Event & { currentTarget: EventTarget & Target }) => {
          if (touched) {
            validate();
          }
          handlers.oninput?.(event);
        },
      };
    },
    get ids() {
      return ids;
    },
    get invalid() {
      return invalid;
    },
    get issues() {
      return issues;
    },
    touch,
  };
}
