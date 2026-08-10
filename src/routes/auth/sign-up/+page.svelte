<script lang="ts">
  import type { RemoteFormEnhanceInstance } from "@sveltejs/kit";

  import { identifyUser } from "$lib/analytics";
  import { Form, FormControl, Input, Label } from "$lib/components/form";
  import { nanoid } from "nanoid";

  import { signUpEmail } from "../auth.remote";
  import { signUpEmailSchema } from "../auth.schema";

  const registerForm = signUpEmail.for(nanoid()).preflight(signUpEmailSchema);
  const { name, email, password } = registerForm.fields;

  /** `form` is an untyped copy of the instance; `registerForm.result` is the same state, typed. */
  async function submit(form: RemoteFormEnhanceInstance) {
    if (!(await form.submit())) return;
    const user = registerForm.result?.user;
    if (user) identifyUser(user.id, { email: user.email, name: user.name });
  }
</script>

<div class="flex min-h-full items-center justify-center">
  <div class="w-full max-w-sm space-y-6">
    <h1 class="text-center">Sign up</h1>

    <Form form={registerForm} enhance={submit} class="space-y-4">
      <FormControl>
        <Label>Name</Label>
        <Input field={name} autocomplete="name" />
      </FormControl>

      <FormControl>
        <Label>Email</Label>
        <Input field={email} type="email" autocomplete="email" description="We'll send a verification link here" />
      </FormControl>

      <FormControl>
        <Label>Password</Label>
        <Input
          field={password}
          type="password"
          autocomplete="new-password"
          description="At least 8 characters, with a number and a special character"
        />
      </FormControl>

      <button type="submit" disabled={!!registerForm.pending} class="w-full">
        {registerForm.pending ? "Signing up..." : "Sign up"}
      </button>
    </Form>

    <p class="text-center text-sm">
      Already have an account? <a href="/auth/sign-in">Sign in</a>
    </p>
  </div>
</div>
