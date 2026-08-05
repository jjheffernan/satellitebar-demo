/// <reference types="astro/client" />
/// <reference types="@astrojs/svelte/svelte-shims.d.ts" />

declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component<Record<string, unknown>>;
  export default component;
}
