<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  import { createControlIds, setControlContext } from "./context";

  type Props = HTMLAttributes<HTMLDivElement> & {
    children: Snippet;
    /** Override the generated id used to link the label, input, description and error */
    id?: string;
  };

  let { children, id, class: className, ...rest }: Props = $props();

  // Derived rather than snapshot, so an explicitly passed `id` can change; with no `id` the nanoid
  // is generated once, since `id` is the only dependency.
  const ids = $derived(createControlIds(id));

  setControlContext({
    get id() {
      return ids.id;
    },
    get descriptionId() {
      return ids.descriptionId;
    },
    get errorId() {
      return ids.errorId;
    },
  });
</script>

<div {...rest} class={cn("flex w-full flex-col", className)}>
  {@render children()}
</div>
