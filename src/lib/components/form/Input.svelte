<script lang="ts" generics="Value extends string | number">
  import { cn } from "$lib/utils";
  import type { RemoteFormField, RemoteFormFieldType } from "@sveltejs/kit";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { asField, createField } from "./field.svelte";
  import FieldMessages from "./FieldMessages.svelte";

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
    class: className,
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
  class={cn(
    "bg-input/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-2xl border border-transparent px-2.5 py-1 text-base transition-[color,box-shadow,border] duration-200 outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 md:text-sm",
    className,
  )}
/>

<FieldMessages {control} {description} />
