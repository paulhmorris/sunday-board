<script lang="ts">
  import { signUpEmail } from "../auth.remote";
  import { signUpEmailSchema } from "../auth.schema";

  const registerForm = signUpEmail
    .for(crypto.randomUUID())
    .preflight(signUpEmailSchema);
  const { name, email, password } = registerForm.fields;
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-full max-w-sm space-y-6">
    <h1 class="text-center">Sign up</h1>

    {#if registerForm.result?.data?.message}
      <p class="text-sm text-red-600">{registerForm.result.data.message}</p>
    {/if}

    <form {...registerForm} class="space-y-4">
      <div>
        <label for="name">Name</label>
        <input id="name" {...name.as("text")} autocomplete="name" />
        {#each name.issues() ?? [] as issue (issue.message)}
          <p class="mt-1 text-sm text-red-600">{issue.message}</p>
        {/each}
      </div>

      <div>
        <label for="email">Email</label>
        <input id="email" {...email.as("email")} autocomplete="email" />
        {#each email.issues() ?? [] as issue (issue.message)}
          <p class="mt-1 text-sm text-red-600">{issue.message}</p>
        {/each}
      </div>

      <div>
        <label for="password" class="block text-sm font-medium">Password</label>
        <input
          id="password"
          {...password.as("password")}
          autocomplete="new-password"
        />
        {#each password.issues() ?? [] as issue (issue.message)}
          <p class="mt-1 text-sm text-red-600">{issue.message}</p>
        {/each}
      </div>

      <button type="submit" disabled={!!registerForm.pending} class="w-full">
        {registerForm.pending ? "Signing up..." : "Sign up"}
      </button>
    </form>

    <p class="text-center text-sm">
      Already have an account? <a href="/auth/sign-in" class="underline"
        >Sign in</a
      >
    </p>
  </div>
</div>
