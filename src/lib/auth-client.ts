import { auth } from "$lib/server/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte"; // make sure to import from better-auth/svelte

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
