# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.6 create --template minimal --types ts --add tailwind="plugins:forms" vitest="usages:unit,component" mcp="ide:claude-code+setup:remote" --install npm ./
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Testing

```sh
npm run test        # everything, once
npm run test:unit   # watch mode
```

Two vitest projects run: `client` (component tests in the browser, `*.svelte.test.ts`)
and `server` (node, every other `*.test.ts`). Both need a populated `.env` — some
modules read `$app/env` at import time — but nothing else: no database is provisioned
or reached, since server tests inject a mocked `PrismaClient` via `mockDb()` from
`$lib/server/testing/mock-db`.

Server-side behaviour is tested at the service seam. Read
[ADR 0001](docs/adr/0001-service-layer-and-test-seam.md) before adding a service or a
test for one; `src/lib/server/services/account.ts` and its test are the reference pair.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
