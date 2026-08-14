<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  import { setFieldGroupContext } from "./context";
  import { asField, createField } from "./field.svelte";
  import Fieldset from "./fieldset.svelte";

  type Props = Omit<HTMLFieldsetAttributes, "name"> & {
    /** An array field — each `<Checkbox value="..." />` inside contributes one entry */
    field: RemoteFormField<string[]>;
    legend: string;
    children: Snippet;
    description?: string;
  };

  let { field, legend, children, description, ...rest }: Props = $props();

  const control = createField({
    description: () => description,
    id: () => rest.id ?? undefined,
    issues: () => asField(field).issues(),
  });

  setFieldGroupContext({
    control,
    get field() {
      return asField(field);
    },
  });
</script>

<Fieldset {legend} {description} {control} {...rest}>
  {@render children()}
</Fieldset>
