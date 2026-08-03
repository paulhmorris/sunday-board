<script lang="ts">
  import { dev } from "$app/environment";
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { HTMLInputAttributes } from "svelte/elements";

  import FieldMessages from "./FieldMessages.svelte";
  import { asField, createField } from "./field.svelte";

  type Props = Omit<HTMLInputAttributes, "name" | "type" | "value" | "files" | "multiple"> & {
    description?: string;
  } & (
      | { field: RemoteFormField<File>; multiple?: false }
      | { field: RemoteFormField<File[]>; multiple: true }
    );

  let { field, multiple = false, description, onblur, onchange, oninput, ...rest }: Props = $props();

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
/>

<FieldMessages {control} {description} />
