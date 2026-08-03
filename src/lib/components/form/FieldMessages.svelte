<script lang="ts">
  import type { createField } from "./field.svelte";

  interface Props {
    control: ReturnType<typeof createField>;
    description?: string;
  }

  let { control, description }: Props = $props();
</script>

{#if description}
  <p id={control.ids.descriptionId} class="description">{description}</p>
{/if}

{#if control.issues.length > 0}
  <div id={control.ids.errorId}>
    {#each control.issues as issue (issue.message)}
      <p class="error">{issue.message}</p>
    {/each}
  </div>
{/if}

<style>
  .description {
    margin-top: var(--spacing);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
    color: var(--color-neutral-500);
  }

  .error {
    margin-top: var(--spacing);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
    font-weight: var(--font-weight-medium);
    color: var(--color-red-600);
  }
</style>
