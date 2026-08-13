<script lang="ts">
  import { cn } from "$lib/utils";
  import type { RemoteFormField } from "@sveltejs/kit";
  import CaretDownIcon from "phosphor-svelte/lib/CaretDown";
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";

  import { asField, createField } from "./field.svelte";
  import FieldMessages from "./FieldMessages.svelte";

  type Props = Omit<HTMLSelectAttributes, "name" | "multiple" | "value"> & {
    /** The `<option>` elements */
    children: Snippet;
    description?: string;
  } & ({ field: RemoteFormField<string>; multiple?: false } | { field: RemoteFormField<string[]>; multiple: true });

  let {
    field,
    children,
    multiple = false,
    description,
    onblur,
    onchange,
    oninput,
    class: className,
    ...rest
  }: Props = $props();

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

<!-- A native `<select>` can't render its own arrow, so the caret is an absolutely positioned sibling. -->
<div class={cn("relative w-fit", multiple ? "w-full" : undefined, className)}>
  <select
    {...attributes()}
    {...rest}
    {...control.attributes}
    {...control.events({ onblur, onchange, oninput })}
    class={cn(
      "bg-input/50 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 w-full min-w-0 appearance-none rounded-2xl border border-transparent text-sm transition-[color,box-shadow] duration-200 outline-none select-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
      multiple ? "min-h-16 px-2.5 py-1.5" : "h-8 py-1 pr-8 pl-2.5",
    )}
  >
    {@render children()}
  </select>
  {#if !multiple}
    <CaretDownIcon
      class="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 select-none"
      aria-hidden="true"
    />
  {/if}
</div>

<FieldMessages {control} {description} />
