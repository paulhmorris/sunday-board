export function delay(ms: number) {
  if (import.meta.env.PROD) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
