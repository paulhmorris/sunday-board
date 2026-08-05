<script lang="ts">
  import { identifyUser, resetAnalytics, trackPageView } from "$lib/analytics";
  import favicon from "$lib/assets/favicon.svg";
  import Navbar from "$lib/components/Navbar.svelte";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import "./layout.css";

  let { children } = $props();

  afterNavigate(({ to }) => {
    if (to) trackPageView(to.url.href);
  });

  let identifiedUserId: string | null = null;

  $effect(() => {
    const user = page.data.user;

    if (user && user.id !== identifiedUserId) {
      identifiedUserId = user.id;
      identifyUser(user.id, { email: user.email, name: user.name });
    } else if (!user && identifiedUserId) {
      identifiedUserId = null;
      resetAnalytics();
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex h-full">
  <Navbar />
  <main class="flex-1 p-8">
    {@render children()}
  </main>
</div>
