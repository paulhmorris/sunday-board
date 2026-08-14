import type { ErrorEvent } from "@sentry/sveltekit";

export * as Sentry from "@sentry/sveltekit";

/**
 * Repo-relative module path of the deepest in-app frame, e.g. `lib/server/services/account`.
 * Returns undefined when frames carry bundled filenames rather than original paths, so the
 * tag is absent rather than wrong.
 */
export function deriveModuleTag(event: ErrorEvent): string | undefined {
  const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];

  for (let i = frames.length - 1; i >= 0; i--) {
    const frame = frames[i];
    if (frame?.in_app === false) {
      continue;
    }

    const module = frame?.filename?.match(/(?:^|\/)src\/(.+?)\.(?:ts|js|svelte)$/)?.[1];
    if (module) {
      return module;
    }
  }

  return undefined;
}

export function tagModule(event: ErrorEvent): ErrorEvent {
  const module = deriveModuleTag(event);
  if (module) {
    event.tags = { ...event.tags, module };
  }
  return event;
}
