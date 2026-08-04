<script>
  let { pathname = "/", links = [] } = $props();

  let open = $state(false);

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }
</script>

<header class="site-header">
  <div class="site-header__inner container-site">
    <a class="site-header__brand" href="/" aria-label="Satellite Bar home">
      <span class="site-header__mark" aria-hidden="true"></span>
      <span class="site-header__name">Satellite Bar</span>
    </a>

    <nav class="site-header__nav" aria-label="Primary">
      {#each links as link}
        <a class="site-header__link" class:active={isActive(link.href)} href={link.href}>
          {link.label}
        </a>
      {/each}
    </nav>

    <a class="site-header__cta" href="/book">Get a quote</a>

    <button
      class="site-header__menu"
      type="button"
      aria-expanded={open}
      aria-controls="mobile-nav"
      onclick={() => (open = !open)}
    >
      {open ? "Close" : "Menu"}
    </button>
  </div>

  {#if open}
    <nav id="mobile-nav" class="site-header__drawer" aria-label="Mobile">
      {#each links as link}
        <a href={link.href} onclick={() => (open = false)}>{link.label}</a>
      {/each}
      <a href="/book" onclick={() => (open = false)}>Get a quote</a>
    </nav>
  {/if}
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: color-mix(in oklch, var(--background) 92%, transparent);
    border-bottom: 1px solid color-mix(in oklch, var(--border) 70%, transparent);
  }

  @supports (backdrop-filter: blur(8px)) {
    .site-header {
      backdrop-filter: blur(8px);
    }
  }

  .site-header__inner {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 3.15rem;
  }

  .site-header__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    text-decoration: none;
    margin-right: auto;
  }

  .site-header__mark {
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 999px;
    background: var(--primary);
    box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary) 25%, transparent);
  }

  .site-header__name {
    font-family: var(--font-heading);
    font-weight: 700;
    letter-spacing: -0.03em;
    font-size: 1.05rem;
  }

  .site-header__nav {
    display: none;
    gap: 1.25rem;
  }

  .site-header__link {
    text-decoration: none;
    color: var(--muted-foreground);
    font-size: 0.92rem;
  }

  .site-header__link.active,
  .site-header__link:hover {
    color: var(--foreground);
  }

  .site-header__cta {
    display: none;
    text-decoration: none;
    background: var(--primary);
    color: var(--primary-foreground);
    padding: 0.55rem 0.95rem;
    border-radius: var(--radius-md);
    font-size: 0.88rem;
    font-weight: 600;
  }

  .site-header__menu {
    display: inline-flex;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--foreground);
    border-radius: var(--radius-md);
    padding: 0.45rem 0.75rem;
    font: inherit;
    cursor: pointer;
  }

  .site-header__drawer {
    display: grid;
    gap: 0.45rem;
    padding: 0.65rem var(--space-gutter) 0.85rem;
    border-top: 1px solid var(--border);
  }

  .site-header__drawer a {
    text-decoration: none;
    font-family: var(--font-heading);
    font-size: 1.05rem;
  }

  @media (min-width: 860px) {
    .site-header__nav,
    .site-header__cta {
      display: inline-flex;
    }

    .site-header__menu,
    .site-header__drawer {
      display: none;
    }
  }
</style>
