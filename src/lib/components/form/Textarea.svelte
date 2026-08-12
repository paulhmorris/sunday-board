<script lang="ts" generics="Value extends string">
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  import FieldMessages from "./FieldMessages.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLTextareaAttributes, "name" | "value"> & {
    field: RemoteFormField<Value>;
    /** Initial/reset value — the second argument to `field.as(...)` */
    value?: Value;
    description?: string;
  };

  let { field, value, description, onblur, onchange, oninput, class: className, ...rest }: Props = $props();

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
  class={cn(
    "flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-transparent bg-input/50 px-2.5 py-2 text-base outline-none transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    className,
  )}
></textarea>

<FieldMessages {control} {description} />
