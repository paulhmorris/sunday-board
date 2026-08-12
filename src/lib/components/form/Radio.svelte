<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

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
    class="size-4 shrink-0 border-transparent bg-input/90 text-primary outline-none transition-shadow focus:ring-3 focus:ring-ring/30 focus:ring-offset-0 checked:border-transparent aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
  />
  <label for={ids.id} class="select-none">{@render children()}</label>
</div>
