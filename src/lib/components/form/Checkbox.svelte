<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import { type Snippet, untrack } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

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

<div class={["option", className]}>
  <input
    {...attributes()}
    {...rest}
    id={ids.id}
    aria-invalid={control.invalid ? "true" : undefined}
    aria-describedby={group ? undefined : control.describedBy}
    aria-errormessage={!group && control.invalid ? ids.errorId : undefined}
    {...control.events({ onblur, onchange, oninput })}
  />
  <label for={ids.id}>{@render children()}</label>
</div>

{#if !group}
  <FieldMessages {control} {description} />
{/if}

<style>
  .option {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 2);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }
</style>
