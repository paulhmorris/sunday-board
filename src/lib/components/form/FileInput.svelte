<script lang="ts">
  import { dev } from "$app/environment";
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { HTMLInputAttributes } from "svelte/elements";

  import { cn } from "$lib/utils";

  import FieldMessages from "./FieldMessages.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLInputAttributes, "name" | "type" | "value" | "files" | "multiple"> & {
    description?: string;
  } & (
      | { field: RemoteFormField<File>; multiple?: false }
      | { field: RemoteFormField<File[]>; multiple: true }
    );

  let { field, multiple = false, description, onblur, onchange, oninput, class: className, ...rest }: Props = $props();

  const control = createField({
    issues: () => asField(field).issues(),
    id: () => rest.id ?? undefined,
    description: () => description,
  });

  // A file only survives a submission without JavaScript if the form is multipart-encoded, and the
  // form can't infer that from its children during SSR — so say so loudly in dev.
  function warnUnlessMultipart(node: HTMLInputElement) {
    if (!dev || !node.form || node.form.enctype === "multipart/form-data") return;

    console.warn(
      `<FileInput /> for "${node.name}" is inside a form without enctype="multipart/form-data". ` +
        `The file will be dropped if the form submits without JavaScript.`,
    );
  }
</script>

<input
  {@attach warnUnlessMultipart}
  {...asField(field).as(multiple ? "file multiple" : "file")}
  {...rest}
  {...control.attributes}
  {...control.events({ onblur, onchange, oninput })}
  class={cn(
    "h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base outline-none transition-[color,box-shadow] duration-200 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    className,
  )}
/>

<FieldMessages {control} {description} />
