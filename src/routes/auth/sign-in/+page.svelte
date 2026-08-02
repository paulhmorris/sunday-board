<script lang="ts">
  import { nanoid } from "nanoid";
  import { signInEmail } from "../auth.remote";
  import { signInEmailSchema } from "../auth.schema";

  const loginForm = signInEmail.for(nanoid()).preflight(signInEmailSchema);
  const { email, password } = loginForm.fields;
</script>

<div class="flex min-h-full items-center justify-center">
  <div class="w-full max-w-sm space-y-6">
    <h1 class="text-center">Sign in</h1>

    <form {...loginForm} class="space-y-4" novalidate>
      <div>
        <label for="email">Email</label>
        <input
          {...email.as("email")}
          id="email"
          aria-invalid={!!email.issues()?.length}
          autocomplete="email"
        />
        {#each email.issues() ?? [] as issue (issue.message)}
          <p class="field-error">{issue.message}</p>
        {/each}
      </div>

      <div>
        <label for="password">Password</label>
        <input
          {...password.as("password")}
          id="password"
          aria-invalid={!!password.issues()?.length}
          autocomplete="current-password"
        />
        {#each password.issues() ?? [] as issue (issue.message)}
          <p class="field-error">{issue.message}</p>
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
