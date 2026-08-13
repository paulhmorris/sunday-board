<script lang="ts">
  import { cn } from "$lib/utils";
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

<div class={cn("flex items-center gap-2 text-sm", className)}>
  <input
    {...group.field.as("radio", value)}
    {...rest}
    id={ids.id}
    aria-invalid={group.control.invalid ? "true" : undefined}
    {...group.control.events({ onblur, onchange, oninput })}
    class="bg-input/90 text-primary focus:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 size-4 shrink-0 border-transparent transition-shadow outline-none checked:border-transparent focus:ring-3 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3"
  />
  <label for={ids.id} class="select-none">{@render children()}</label>
</div>
