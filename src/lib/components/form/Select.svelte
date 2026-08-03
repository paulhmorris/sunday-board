<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";

  import FieldMessages from "./FieldMessages.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLSelectAttributes, "name" | "multiple" | "value"> & {
    /** The `<option>` elements */
    children: Snippet;
    description?: string;
  } & (
      | { field: RemoteFormField<string>; multiple?: false }
      | { field: RemoteFormField<string[]>; multiple: true }
    );

  let { field, children, multiple = false, description, onblur, onchange, oninput, ...rest }: Props = $props();

  const control = createField({
    issues: () => asField(field).issues(),
    id: () => rest.id ?? undefined,
    description: () => description,
  });

  function attributes() {
    const { value, ...attrs } = asField(field).as(multiple ? "select multiple" : "select");

    // Kit's `value` getter is `undefined` until the field has a value, and assigning that to a
    // `<select>` deselects everything (selectedIndex -1) — which silently wipes a placeholder
    // `<option>` the first time anything re-renders. Leave the DOM alone until there's a value.
    return value === undefined ? attrs : { ...attrs, value };
  }
</script>

<select
  {...attributes()}
  {...rest}
  {...control.attributes}
  {...control.events({ onblur, onchange, oninput })}
>
  {@render children()}
</select>

<FieldMessages {control} {description} />
