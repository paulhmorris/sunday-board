<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLLabelAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  import { getControlContext } from "./context";

  type Props = HTMLLabelAttributes & {
    children: Snippet;
  };

  let { children, for: htmlFor, class: className, ...rest }: Props = $props();

  const control = getControlContext();
</script>

<label
  {...rest}
  for={htmlFor ?? control?.id}
  class={cn(
    "mb-1.5 flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
    className,
  )}
>
  {@render children()}
</label>
