<script lang="ts" generics="Value extends string">
  import { cn } from "$lib/utils";
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { HTMLTextareaAttributes } from "svelte/elements";

  import FieldMessages from "./field-messages.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLTextareaAttributes, "name" | "value"> & {
    field: RemoteFormField<Value>;
    /** Initial/reset value — the second argument to `field.as(...)` */
    value?: Value;
    description?: string;
  };

  let { field, value, description, onblur, onchange, oninput, class: className, ...rest }: Props = $props();

  const control = createField({
    description: () => description,
    id: () => rest.id ?? undefined,
    issues: () => field.issues(),
  });
</script>

<textarea
  {...asField(field).as("text", value)}
  {...rest}
  {...control.attributes}
  {...control.events({ onblur, onchange, oninput })}
  class={cn(
    "bg-input/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-transparent px-2.5 py-2 text-base transition-[color,box-shadow] duration-200 outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
    className,
  )}></textarea>

<FieldMessages {control} {description} />
