<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { createControlIds, getFieldGroupContext } from "./context";

  type Props = Omit<HTMLInputAttributes, "name" | "type" | "value" | "checked"> & {
    /** The value submitted when this button is selected */
    value: string;
    children: Snippet;
  };

  let { value, children, class: className, onblur, onchange, oninput, ...rest }: Props = $props();

  const group = getFieldGroupContext();

  if (!group) {
    throw new Error("<Radio /> must be used inside a <RadioGroup />, which owns the field it belongs to.");
  }

  const ids = $derived(createControlIds(rest.id ?? undefined));
</script>

<div class={["option", className]}>
  <input
    {...group.field.as("radio", value)}
    {...rest}
    id={ids.id}
    aria-invalid={group.control.invalid ? "true" : undefined}
    {...group.control.events({ onblur, onchange, oninput })}
  />
  <label for={ids.id}>{@render children()}</label>
</div>

<style>
  .option {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) * 2);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }
</style>
