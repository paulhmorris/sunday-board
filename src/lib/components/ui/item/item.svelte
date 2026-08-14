<script lang="ts" module>
  import { tv } from "tailwind-variants";
  import type { VariantProps } from "tailwind-variants";

  export const itemVariants = tv({
    base: "rounded-2xl border text-sm [a]:hover:bg-muted group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors",
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "gap-3.5 px-4 py-3.5",
        sm: "gap-3.5 px-3.5 py-3",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
      variant: {
        default: "border-transparent",
        muted: "border-transparent bg-muted/50",
        outline: "border-border",
      },
    },
  });

  export type ItemSize = VariantProps<typeof itemVariants>["size"];
  export type ItemVariant = VariantProps<typeof itemVariants>["variant"];
</script>

<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { WithElementRef } from "$lib/utils.types.js";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    child,
    variant,
    size,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    child?: Snippet<[{ props: Record<string, unknown> }]>;
    variant?: ItemVariant;
    size?: ItemSize;
  } = $props();

  const mergedProps = $derived({
    class: cn(itemVariants({ size, variant }), className),
    "data-size": size,
    "data-slot": "item",
    "data-variant": variant,
    ...restProps,
  });
</script>

{#if child}
  {@render child({ props: mergedProps })}
{:else}
  <div bind:this={ref} {...mergedProps}>
    {@render mergedProps.children?.()}
  </div>
{/if}
