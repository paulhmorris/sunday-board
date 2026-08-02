<script lang="ts">
  let { data } = $props();
</script>

<h1>Me</h1>
<pre class="text-xs">{JSON.stringify(data.user, null, 2)}</pre>
