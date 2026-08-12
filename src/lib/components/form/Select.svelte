<script lang="ts">
  import type { RemoteFormField } from "@sveltejs/kit";
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";

  import CaretDownIcon from "phosphor-svelte/lib/CaretDown";

  import { cn } from "$lib/utils";

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
      "w-full min-w-0 appearance-none rounded-2xl border border-transparent bg-input/50 text-sm outline-none transition-[color,box-shadow] duration-200 select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
      multiple ? "min-h-16 px-2.5 py-1.5" : "h-8 py-1 pr-8 pl-2.5",
    )}
  >
    {@render children()}
  </select>
  {#if !multiple}
    <CaretDownIcon
      class="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
      aria-hidden="true"
    />
  {/if}
</div>

<FieldMessages {control} {description} />
