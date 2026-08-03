<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { Snippet } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  import { setFieldGroupContext } from "./context";
  import Fieldset from "./Fieldset.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLFieldsetAttributes, "name"> & {
    field: RemoteFormField<string>;
    legend: string;
    /** The `<Radio />` buttons */
    children: Snippet;
    description?: string;
  };

  let { field, legend, children, description, ...rest }: Props = $props();

  const control = createField({
    issues: () => asField(field).issues(),
    id: () => rest.id ?? undefined,
    description: () => description,
  });

  setFieldGroupContext({
    get field() {
      return asField(field);
    },
    control,
  });
</script>

<Fieldset {legend} {description} {control} {...rest}>
  {@render children()}
</Fieldset>
