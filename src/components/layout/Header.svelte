<script>
  let {
    pathname = "/",
    links = [],
    phone = "",
    activeFeatures = [],
  } = $props();

  let open = $state(false);
  let openMenu = $state("");

  function featureOn(feature) {
    if (!feature) return true;
    return activeFeatures.includes(feature);
  }

  function visibleLinks(items) {
    return items.filter((link) => featureOn(link.feature));
  }

  function isActive(href) {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function groupActive(link) {
    if (link.href && isActive(link.href)) return true;
    return (link.children ?? []).some((c) => isActive(c.href));
  }
</script>

<header class="site-header">
  <div class="site-header__inner container-site">
    <a class="site-header__brand" href="/" aria-label="Satellite Bar home">
      <span class="site-header__logo" aria-hidden="true">SB</span>
      <span class="site-header__name">Satellite Bar</span>
    </a>

    <nav class="site-header__nav" aria-label="Primary">
      {#each visibleLinks(links) as link}
        {#if link.children?.length}
          {@const kids = visibleLinks(link.children)}
          {#if kids.length}
            <details
              class="site-header__group"
              open={openMenu === link.label}
              ontoggle={(e) => {
                openMenu = e.currentTarget.open ? link.label : "";
              }}
            >
              <summary class:active={groupActive(link)}>
                {#if link.href}
                  <a
                    class="site-header__group-link"
                    href={link.href}
                    onclick={(e) => e.stopPropagation()}
                  >{link.label}</a>
                {:else}
                  {link.label}
                {/if}
              </summary>
              <div class="site-header__dropdown">
                {#each kids as child}
                  <a class:active={isActive(child.href)} href={child.href}>{child.label}</a>
                {/each}
              </div>
            </details>
          {/if}
        {:else}
          <a class="site-header__link" class:active={isActive(link.href)} href={link.href}>
            {link.label}
          </a>
        {/if}
      {/each}
    </nav>

    <div class="site-header__actions">
      {#if phone}
        <a class="site-header__call" href={`tel:${phone.replace(/\D/g, "")}`}>Call us</a>
      {/if}
      <a class="site-header__cta" href="/book">Book now</a>
    </div>

    <button
      class="site-header__menu"
      type="button"
      aria-expanded={open}
      aria-controls="mobile-nav"
      onclick={() => {
        open = !open;
        if (!open) openMenu = "";
      }}
    >
      {open ? "Close" : "Menu"}
    </button>
  </div>

  {#if open}
    <nav id="mobile-nav" class="site-header__drawer" aria-label="Mobile">
      {#each visibleLinks(links) as link}
        {#if link.children?.length}
          {@const kids = visibleLinks(link.children)}
          {#if kids.length}
            <details
              class="site-header__group"
              open={openMenu === link.label}
              ontoggle={(e) => {
                openMenu = e.currentTarget.open ? link.label : "";
              }}
            >
              <summary class:active={groupActive(link)}>
                {#if link.href}
                  <a
                    class="site-header__group-link"
                    href={link.href}
                    onclick={(e) => {
                      e.stopPropagation();
                      open = false;
                      openMenu = "";
                    }}
                  >{link.label}</a>
                {:else}
                  {link.label}
                {/if}
              </summary>
              <div class="site-header__dropdown">
                {#each kids as child}
                  <a
                    class:active={isActive(child.href)}
                    href={child.href}
                    onclick={() => {
                      open = false;
                      openMenu = "";
                    }}
                  >{child.label}</a>
                {/each}
              </div>
            </details>
          {/if}
        {:else}
          <a
            class="site-header__link"
            class:active={isActive(link.href)}
            href={link.href}
            onclick={() => {
              open = false;
              openMenu = "";
            }}
          >
            {link.label}
          </a>
        {/if}
      {/each}
      <div class="site-header__drawer-actions">
        {#if phone}
          <a
            class="site-header__call"
            href={`tel:${phone.replace(/\D/g, "")}`}
            onclick={() => (open = false)}
          >Call us</a>
        {/if}
        <a class="site-header__cta" href="/book" onclick={() => (open = false)}>Book now</a>
      </div>
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
    gap: 0.75rem;
    min-height: 3.15rem;
  }

  .site-header__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    text-decoration: none;
    margin-right: auto;
  }

  .site-header__logo {
    display: inline-grid;
    place-items: center;
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 999px;
    background: var(--primary);
    color: var(--primary-foreground);
    font-family: var(--font-heading);
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: -0.04em;
  }

  .site-header__name {
    font-family: var(--font-heading);
    font-weight: 700;
    letter-spacing: -0.03em;
    font-size: 1.05rem;
  }

  .site-header__nav {
    display: none;
    align-items: center;
    gap: 0.85rem;
  }

  .site-header__link,
  .site-header__group summary,
  .site-header__group-link {
    text-decoration: none;
    color: var(--muted-foreground);
    font-size: 0.88rem;
    cursor: pointer;
    list-style: none;
  }

  .site-header__group summary {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .site-header__group summary::after {
    content: "";
    width: 0.35rem;
    height: 0.35rem;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg) translateY(-0.1rem);
    opacity: 0.7;
  }

  .site-header__group summary::-webkit-details-marker {
    display: none;
  }

  .site-header__link.active,
  .site-header__link:hover,
  .site-header__group summary.active,
  .site-header__group summary:hover,
  .site-header__group summary.active .site-header__group-link,
  .site-header__group-link:hover {
    color: var(--foreground);
  }

  .site-header__group {
    position: relative;
  }

  .site-header__dropdown {
    position: absolute;
    top: calc(100% + 0.55rem);
    left: 0;
    min-width: 11rem;
    display: grid;
    gap: 0.35rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--card);
  }

  .site-header__dropdown a {
    text-decoration: none;
    color: var(--muted-foreground);
    font-size: 0.85rem;
  }

  .site-header__dropdown a.active,
  .site-header__dropdown a:hover {
    color: var(--primary);
  }

  .site-header__actions {
    display: none;
    align-items: center;
    gap: 0.65rem;
  }

  .site-header__call {
    color: var(--primary);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .site-header__cta {
    text-decoration: none;
    background: var(--primary);
    color: var(--primary-foreground);
    padding: 0.45rem 0.85rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .site-header__menu {
    display: inline-flex;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--foreground);
    border-radius: var(--radius-md);
    padding: 0.4rem 0.7rem;
    font: inherit;
    cursor: pointer;
  }

  .site-header__drawer {
    display: grid;
    gap: 0.15rem;
    padding: 0.55rem var(--space-gutter) 0.95rem;
    border-top: 1px solid var(--border);
  }

  .site-header__drawer .site-header__link,
  .site-header__drawer .site-header__group summary,
  .site-header__drawer .site-header__group-link {
    font-size: 0.95rem;
    padding: 0.55rem 0;
  }

  .site-header__drawer .site-header__group {
    position: static;
  }

  .site-header__drawer .site-header__group summary {
    width: 100%;
    justify-content: space-between;
  }

  .site-header__drawer .site-header__group[open] summary::after {
    transform: rotate(225deg) translateY(-0.05rem);
  }

  .site-header__drawer .site-header__dropdown {
    position: static;
    top: auto;
    left: auto;
    min-width: 0;
    width: 100%;
    margin: 0 0 0.35rem;
    padding: 0.45rem 0.75rem;
  }

  .site-header__drawer-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.55rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }

  @media (min-width: 960px) {
    .site-header__nav,
    .site-header__actions {
      display: inline-flex;
    }

    .site-header__menu,
    .site-header__drawer {
      display: none;
    }
  }
</style>
