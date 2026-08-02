<script lang="ts">
  import { signInEmail } from "../auth.remote";
  import { signInEmailSchema } from "../auth.schema";

  const loginForm = signInEmail
    .for(crypto.randomUUID())
    .preflight(signInEmailSchema);
  const { email, password } = loginForm.fields;
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-sm space-y-6">
    <h1 class="text-center">Sign in</h1>

    {#if loginForm.result?.data?.message}
      <p class="text-sm text-red-600">{loginForm.result.data.message}</p>
    {/if}

    <form {...loginForm} class="space-y-4">
      <div>
        <label for="email">Email</label>
        <input id="email" {...email.as("email")} autocomplete="email" />
        {#each email.issues() ?? [] as issue (issue.message)}
          <p class="mt-1 text-sm text-red-600">{issue.message}</p>
        {/each}
      </div>

      <div>
        <label for="password">Password</label>
        <input
          id="password"
          {...password.as("password")}
          autocomplete="current-password"
        />
        {#each password.issues() ?? [] as issue (issue.message)}
          <p class="mt-1 text-sm text-red-600">{issue.message}</p>
        {/each}
      </div>

      <button type="submit" disabled={!!loginForm.pending} class="w-full">
        {loginForm.pending ? "Signing in..." : "Sign in"}
      </button>
    </form>

    <p class="text-center text-sm">
      Don't have an account? <a href="/auth/sign-up">Sign up</a>
    </p>
  </div>
</div>
