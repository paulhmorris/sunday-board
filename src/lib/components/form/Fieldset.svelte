<script lang="ts">
  import { type Snippet, untrack } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  import { setTouchSink } from "./context";
  import FieldMessages from "./FieldMessages.svelte";
  import { asField, createField, type FieldController } from "./field.svelte";

  type Props = Omit<HTMLFieldsetAttributes, "name"> & {
    legend: string;
    children: Snippet;
    /** A container field — e.g. an array — whose own issues belong to the group rather than a member */
    field?: unknown;
    description?: string;
    /** Supplied by `<RadioGroup />` / `<CheckboxGroup />`, which own the controller their members share */
    control?: FieldController;
  };

  let { legend, children, field, description, control: provided, class: className, ...rest }: Props = $props();

  // A controller's identity is fixed for the life of the component, hence the untracked read.
  const control =
    untrack(() => provided) ??
    createField({
      issues: () => (field ? asField(field).issues() : undefined),
      id: () => rest.id ?? undefined,
      description: () => description,
    });

  // Touching anything inside marks the fieldset touched too, so container-level issues can surface.
  setTouchSink({ touch: control.touch });
</script>

<fieldset {...rest} {...control.attributes} class={["fieldset", className]}>
  <legend class="legend">{legend}</legend>
  {@render children()}
  <FieldMessages {control} {description} />
</fieldset>

<style>
  .fieldset {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 1.5);
  }

  .legend {
    margin-bottom: var(--spacing);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
    font-weight: var(--font-weight-medium);
  }
</style>
