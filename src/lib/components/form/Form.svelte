<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLFormAttributes } from "svelte/elements";

  import { type AnyRemoteForm, setFormContext } from "./context";

  type Props = Omit<HTMLFormAttributes, "method" | "action"> & {
    form: AnyRemoteForm;
    children: Snippet;
  };

  let { form, children, ...rest }: Props = $props();

  setFormContext({
    get form() {
      return form;
    },
  });

  // Issues without a path belong to the form as a whole (e.g. `invalid("Registration failed")`).
  // Field-level issues are rendered by the field components themselves.
  const formIssues = $derived(form.fields.allIssues()?.filter((issue) => issue.path.length === 0) ?? []);
</script>

<form {...form} novalidate {...rest}>
  {#if formIssues.length > 0}
    <div role="alert">
      {#each formIssues as issue (issue.message)}
        <p class="error">{issue.message}</p>
      {/each}
    </div>
  {/if}

  {@render children()}
</form>

<style>
  .error {
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
    font-weight: var(--font-weight-medium);
    color: var(--color-red-600);
  }
</style>
