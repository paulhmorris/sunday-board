<script lang="ts">
  import { fade } from "svelte/transition";
  import type { createField } from "./field.svelte";

  interface Props {
    control: ReturnType<typeof createField>;
    description?: string;
  }

  let { control, description }: Props = $props();
</script>

{#if description}
  <p id={control.ids.descriptionId} class="mt-1 text-xs text-muted-foreground">
    {description}
  </p>
{/if}

<div id={control.ids.errorId} role="alert" class="mt-1 min-h-4">
  {#each control.issues as issue (issue.message)}
    <p
      transition:fade={{ duration: 25 }}
      class="text-xs font-medium text-destructive"
    >
      {issue.message}
    </p>
  {/each}
</div>
