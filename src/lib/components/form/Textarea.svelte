<script lang="ts" generics="Value extends string">
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  import FieldMessages from "./FieldMessages.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLTextareaAttributes, "name" | "value"> & {
    field: RemoteFormField<Value>;
    /** Initial/reset value — the second argument to `field.as(...)` */
    value?: Value;
    description?: string;
  };

  let { field, value, description, onblur, onchange, oninput, ...rest }: Props = $props();

  const control = createField({
    issues: () => field.issues(),
    id: () => rest.id ?? undefined,
    description: () => description,
  });

</script>

<textarea
  {...asField(field).as("text", value)}
  {...rest}
  {...control.attributes}
  {...control.events({ onblur, onchange, oninput })}
></textarea>

<FieldMessages {control} {description} />
