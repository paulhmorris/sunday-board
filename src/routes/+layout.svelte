<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import Navbar from "$lib/components/Navbar.svelte";

  import "./layout.css";

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex h-dvh">
  <Navbar />
  <main class="flex-1 overflow-y-auto p-8">
    {@render children()}
  </main>
</div>
