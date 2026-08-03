<script lang="ts" generics="Value extends string | number">
  import type { RemoteFormField, RemoteFormFieldType } from "@sveltejs/kit";
  import type { HTMLInputAttributes } from "svelte/elements";

  import FieldMessages from "./FieldMessages.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLInputAttributes, "name" | "type" | "value"> & {
    field: RemoteFormField<Value>;
    /** Constrained by the field's type: a number field only accepts `number` or `range` */
    type?: RemoteFormFieldType<Value>;
    /** Initial/reset value — the second argument to `field.as(...)` */
    value?: Value;
    /** Muted hint rendered below the input and linked via `aria-describedby` */
    description?: string;
  };

  let {
    field,
    type = "text" as RemoteFormFieldType<Value>,
    value,
    description,
    onblur,
    onchange,
    oninput,
    ...rest
  }: Props = $props();

  const control = createField({
    issues: () => field.issues(),
    id: () => rest.id ?? undefined,
    description: () => description,
  });
</script>

<input
  {...asField(field).as(type, value)}
  {...rest}
  {...control.attributes}
  {...control.events({ onblur, onchange, oninput })}
/>

<FieldMessages {control} {description} />
