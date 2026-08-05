<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import { type Snippet, untrack } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  import { createControlIds, getFieldGroupContext } from "./context";
  import FieldMessages from "./FieldMessages.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLInputAttributes, "name" | "type" | "value" | "checked"> & {
    children: Snippet;
    description?: string;
  } & (
      | {
          /** Inside a `<CheckboxGroup />`: the entry this box contributes to the array */
          value: string;
          field?: undefined;
          checked?: undefined;
        }
      | {
          /** Standalone: a boolean field of its own */
          field: RemoteFormField<boolean>;
          value?: undefined;
          /** Initial/reset state */
          checked?: boolean;
        }
    );

  let { children, description, value, field, checked, class: className, onblur, onchange, oninput, ...rest }: Props =
    $props();

  const group = getFieldGroupContext();

  // Which mode a checkbox is in is fixed at creation, so this reads `field` deliberately untracked.
  if (!group && untrack(() => field) === undefined) {
    throw new Error("<Checkbox /> needs either a `field` or an enclosing <CheckboxGroup />.");
  }

  // A grouped checkbox shares the group's controller, so the group decides when issues appear.
  const control =
    group?.control ??
    createField({
      issues: () => asField(field).issues(),
      id: () => rest.id ?? undefined,
      description: () => description,
    });

  const ids = $derived(group ? createControlIds(rest.id ?? undefined) : control.ids);

  function attributes() {
    return group ? group.field.as("checkbox", value) : asField(field).as("checkbox", checked);
  }
</script>

<div class={cn("flex items-center gap-2 text-sm", className)}>
  <input
    {...attributes()}
    {...rest}
    id={ids.id}
    aria-invalid={control.invalid ? "true" : undefined}
    aria-describedby={group ? undefined : control.describedBy}
    aria-errormessage={!group && control.invalid ? ids.errorId : undefined}
    {...control.events({ onblur, onchange, oninput })}
    class="size-4 shrink-0 rounded-[5px] border-transparent bg-input/90 text-primary outline-none transition-shadow focus:ring-3 focus:ring-ring/30 focus:ring-offset-0 checked:border-transparent aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
  />
  <label for={ids.id} class="select-none">{@render children()}</label>
</div>

{#if !group}
  <FieldMessages {control} {description} />
{/if}
