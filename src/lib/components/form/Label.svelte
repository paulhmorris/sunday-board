<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLLabelAttributes } from "svelte/elements";

  import { getControlContext } from "./context";

  type Props = HTMLLabelAttributes & {
    children: Snippet;
  };

  let { children, for: htmlFor, class: className, ...rest }: Props = $props();

  const control = getControlContext();
</script>

<label {...rest} for={htmlFor ?? control?.id} class={["label", className]}>
  {@render children()}
</label>

<style>
  .label {
    display: block;
    margin-bottom: var(--spacing);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
    font-weight: var(--font-weight-medium);
  }
</style>
