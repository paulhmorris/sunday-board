<script lang="ts">
  import type { RemoteFormEnhanceCallback } from "@sveltejs/kit";
  import type { Snippet } from "svelte";
  import type { HTMLFormAttributes } from "svelte/elements";

  import { setFormContext } from "./context";
  import type { AnyRemoteForm } from "./context";

  type Props = Omit<HTMLFormAttributes, "method" | "action"> & {
    form: AnyRemoteForm;
    /**
     * Takes over submission — call `form.submit()` yourself to run it. Must be a stable function
     * reference: a new one re-attaches the submit handler.
     */
    enhance?: RemoteFormEnhanceCallback;
    children: Snippet;
  };

  let { form, enhance, children, ...rest }: Props = $props();

  const attributes = $derived(enhance ? form.enhance(enhance) : form);

  setFormContext({
    get form() {
      return form;
    },
  });

  // Issues without a path belong to the form as a whole (e.g. `invalid("Registration failed")`).
  // Field-level issues are rendered by the field components themselves.
  const formIssues = $derived(form.fields.allIssues()?.filter((issue) => issue.path.length === 0) ?? []);
</script>

<form {...attributes} novalidate {...rest}>
  {#if formIssues.length > 0}
    <div role="alert" class="bg-destructive/10 border-destructive rounded-2xl p-2">
      {#each formIssues as issue (issue.message)}
        <p class="text-destructive text-sm font-medium">{issue.message}</p>
      {/each}
    </div>
  {/if}

  {@render children()}
</form>
