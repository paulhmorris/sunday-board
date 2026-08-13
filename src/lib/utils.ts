import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  if (import.meta.env.PROD) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
