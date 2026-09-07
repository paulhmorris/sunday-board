<script lang="ts">
  import { Form, FormControl, Input, Label } from "$lib/components/form";
  import { Button } from "$lib/components/ui/button";
  import { VERIFICATION_CODE_EXPIRY_SECONDS, VERIFICATION_CODE_LENGTH } from "$lib/verification";
  import { nanoid } from "nanoid";

  import { changeVerificationEmail, resendVerificationCode, verifyEmail } from "../auth.remote";
  import { changeEmailSchema, verifyEmailSchema } from "../auth.schema";

  let { data } = $props();

  const verifyForm = verifyEmail.for(nanoid()).preflight(verifyEmailSchema);
  const resendForm = resendVerificationCode.for(nanoid());
  const correctForm = changeVerificationEmail.for(nanoid()).preflight(changeEmailSchema);

  const { code } = verifyForm.fields;
  const { email } = correctForm.fields;

  let correcting = $state(false);

  // The correction wins: once the address has moved, a resend went to the new one anyway.
  const sentTo = $derived(correctForm.result?.sentTo ?? resendForm.result?.sentTo);
</script>

<div class="flex min-h-full items-center justify-center">
  <div class="w-full max-w-sm space-y-6">
    <h1 class="text-center">Check your email</h1>

    <p class="text-center text-sm">
      We sent a {VERIFICATION_CODE_LENGTH}-digit code to <strong>{sentTo ?? data.email}</strong>. It expires in
      {VERIFICATION_CODE_EXPIRY_SECONDS / 60} minutes.
    </p>

    <Form form={verifyForm} class="space-y-4">
      <FormControl>
        <Label>Verification code</Label>
        <Input
          field={code}
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength={VERIFICATION_CODE_LENGTH}
          autofocus
        />
      </FormControl>

      <Button type="submit" disabled={!!verifyForm.pending} class="w-full">
        {verifyForm.pending ? "Verifying..." : "Verify"}
      </Button>
    </Form>

    <Form form={resendForm} class="space-y-2">
      <Button type="submit" variant="ghost" disabled={!!resendForm.pending} class="w-full">
        {resendForm.pending ? "Sending..." : "Send a new code"}
      </Button>
      {#if sentTo}
        <p role="status" class="text-center text-sm">A new code is on its way to {sentTo}.</p>
      {/if}
    </Form>

    {#if correcting}
      <Form form={correctForm} class="space-y-4">
        <FormControl>
          <Label>Correct your email address</Label>
          <Input field={email} type="email" autocomplete="email" placeholder={data.email} />
        </FormControl>

        <Button type="submit" disabled={!!correctForm.pending} class="w-full">
          {correctForm.pending ? "Sending..." : "Send the code here instead"}
        </Button>
      </Form>
    {:else}
      <p class="text-center text-sm">
        Wrong address?
        <button type="button" class="underline" onclick={() => (correcting = true)}>Change it</button>
      </p>
    {/if}
  </div>
</div>
