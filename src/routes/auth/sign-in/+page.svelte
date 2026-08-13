<script lang="ts">
  import { identifyUser } from "$lib/analytics";
  import { Form, FormControl, Input, Label } from "$lib/components/form";
  import { Button } from "$lib/components/ui/button";
  import type { RemoteFormEnhanceInstance } from "@sveltejs/kit";
  import { nanoid } from "nanoid";

  import { signInEmail } from "../auth.remote";
  import { signInEmailSchema } from "../auth.schema";

  const loginForm = signInEmail.for(nanoid()).preflight(signInEmailSchema);
  const { email, password } = loginForm.fields;

  async function submit(form: RemoteFormEnhanceInstance) {
    if (!(await form.submit())) {
      return;
    }
    const user = loginForm.result?.user;
    if (user) {
      identifyUser(user.id, { email: user.email, name: user.name });
    }
  }
</script>

<div class="flex min-h-full items-center justify-center">
  <div class="w-full max-w-sm space-y-6">
    <h1 class="text-center">Sign in</h1>

    <Form form={loginForm} enhance={submit} class="space-y-4">
      <FormControl>
        <Label>Email</Label>
        <Input field={email} type="email" autocomplete="email" />
      </FormControl>

      <FormControl>
        <Label>Password</Label>
        <Input field={password} type="password" autocomplete="current-password" />
      </FormControl>

      <Button type="submit" disabled={!!loginForm.pending} class="w-full">
        {loginForm.pending ? "Signing in..." : "Sign in"}
      </Button>
    </Form>

    <p class="text-center text-sm">
      Don't have an account? <a href="/auth/sign-up">Sign up</a>
    </p>
  </div>
</div>
