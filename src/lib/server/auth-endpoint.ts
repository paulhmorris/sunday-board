import { getRequestEvent } from "$app/server";
import { auth } from "$lib/server/auth";
import { APIError } from "better-auth/api";
import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";

interface AuthEndpoint<Body, Result> {
  path: string;
  (input: { body: Body; headers: Headers }): Promise<Result>;
}

/** The status union `APIError` accepts, which is narrower than the `number` a `Response` carries. */
type ErrorStatus = NonNullable<ConstructorParameters<typeof APIError>[0]>;

/**
 * Calls a Better Auth endpoint through its HTTP router rather than `auth.api`. The router is where
 * rate limiting and the origin check live — neither runs on a direct `auth.api` call — so every
 * auth call a browser can trigger goes through here.
 *
 * The endpoint is passed rather than its path so the body and result stay typed; `path` is the one
 * the router registered it under.
 */
export async function callAuthEndpoint<Body, Result>(
  endpoint: AuthEndpoint<Body, Result>,
  body?: Body,
): Promise<Result> {
  const event = getRequestEvent();
  const { baseURL } = await auth.$context;

  // The browser's own headers, so the router sees the real cookies, origin and client IP. Only the
  // content type changes: the router accepts JSON, and the form encoding would be refused.
  const headers = new Headers(event.request.headers);
  headers.set("content-type", "application/json");
  headers.delete("content-length");

  const response = await auth.handler(
    new Request(`${baseURL}${endpoint.path}`, { body: JSON.stringify(body ?? {}), headers, method: "POST" }),
  );

  // `sveltekitCookies` deliberately no-ops for router calls, which return their cookies on the
  // response instead, so a session set here reaches the browser only if we copy it across.
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    for (const [name, attributes] of parseSetCookieHeader(setCookie)) {
      event.cookies.set(name, attributes.value, { ...toCookieOptions(attributes), path: attributes.path || "/" });
    }
  }

  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    // Rebuilt as an `APIError` so a caller branches on a refusal the same way whichever path it
    // came from — `error.body.code` from the endpoint, `error.statusCode` 429 from the router.
    throw new APIError(response.status as ErrorStatus, payload ?? {});
  }

  return payload as Result;
}
