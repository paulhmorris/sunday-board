<script lang="ts">
  import { cn } from "$lib/utils";
  import { untrack } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  import { setTouchSink } from "./context";
  import FieldMessages from "./field-messages.svelte";
  import { asField, createField } from "./field.svelte";
  import type { FieldController } from "./field.svelte";

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
      description: () => description,
      id: () => rest.id ?? undefined,
      issues: () => (field ? asField(field).issues() : undefined),
    });

  // Touching anything inside marks the fieldset touched too, so container-level issues can surface.
  setTouchSink({ touch: control.touch });
</script>

<fieldset {...rest} {...control.attributes} class={cn("flex w-full flex-col gap-1.5", className)}>
  <legend class="mb-1 text-sm font-medium">{legend}</legend>
  {@render children()}
  <FieldMessages {control} {description} />
</fieldset>
