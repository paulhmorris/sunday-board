<script lang="ts">
  import { page } from "$app/state";
  import { resetAnalytics } from "$lib/analytics";
  import Button from "$lib/components/ui/button/button.svelte";
  import { signOut } from "../../routes/auth/auth.remote";

  /** Held in a const so the submit attachment isn't recreated on every render. */
  const signOutForm = signOut.enhance(async (form) => {
    // Resolves after the redirect lands, so the next person on this browser starts anonymous.
    if (await form.submit()) resetAnalytics();
  });

  const pageModules = import.meta.glob("/src/routes/**/+page.svelte");

  const routes = Object.keys(pageModules)
    .map(
      (path) =>
        path.replace("/src/routes", "").replace("/+page.svelte", "") || "/",
    )
    .filter((route) => !route.includes("["))
    .sort();

  function initials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
</script>

<nav
  class="flex h-full w-56 flex-col justify-between border-r border-gray-200 p-4"
>
  <ul class="space-y-1">
    {#each routes as route (route)}
      <li>
        <a
          href={route}
          class="block rounded px-2 py-1 text-sm no-underline dark:hover:bg-muted {page
            .url.pathname === route
            ? 'bg-gray-100 dark:bg-muted font-medium'
            : ''}"
        >
          {route}
        </a>
      </li>
    {/each}
  </ul>

  <div class="space-y-2">
    {#if page.data.user}
      <form {...signOutForm}>
        <Button type="submit" class="w-full text-left text-sm">Sign out</Button>
      </form>

      <a href="/me" class="flex items-center gap-2 no-underline">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-medium text-white"
        >
          {initials(page.data.user.name)}
        </span>
        <span class="text-sm">{page.data.user.name}</span>
      </a>
    {/if}
  </div>
</nav>
