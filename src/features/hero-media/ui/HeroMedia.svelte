<script>
  let { slides = [], intervalMs = 4500 } = $props();

  let index = $state(0);
  let paused = $state(false);

  $effect(() => {
    if (typeof window === "undefined" || slides.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused) return;

    const id = window.setInterval(() => {
      index = (index + 1) % slides.length;
    }, intervalMs);

    return () => window.clearInterval(id);
  });

  const current = $derived(slides[index] ?? slides[0]);
</script>

{#if current}
  <figure
    class="hero-media"
    aria-live="polite"
    onmouseenter={() => (paused = true)}
    onmouseleave={() => (paused = false)}
    onfocusin={() => (paused = true)}
    onfocusout={() => (paused = false)}
  >
    <img src={current.src} alt={current.alt} width="1200" height="675" />
    {#if slides.length > 1}
      <div class="dots" role="tablist" aria-label="Hero images">
        {#each slides as slide, i}
          <button
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${slide.title}`}
            onclick={() => (index = i)}
          ></button>
        {/each}
      </div>
    {/if}
    <figcaption>{current.title}</figcaption>
  </figure>
{/if}

<style>
  .hero-media {
    margin: 1.25rem 0 0.35rem;
    position: relative;
    width: min(100%, 52rem);
    background: transparent;
    border: 0;
    border-radius: 0;
    overflow: visible;
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 10;
    min-height: clamp(14rem, 42vw, 22rem);
    object-fit: cover;
    border-radius: 0;
    box-shadow: 0 16px 28px -12px oklch(0 0 0 / 0.55), 0 6px 12px -6px oklch(0 0 0 / 0.35);
  }

  figcaption {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-sm);
    background: color-mix(in oklch, var(--background) 78%, transparent);
    font-size: clamp(0.95rem, 2.4vw, 1.15rem);
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1.2;
  }

  .dots {
    position: absolute;
    right: 1rem;
    bottom: 1.15rem;
    display: flex;
    gap: 0.4rem;
  }

  .dots button {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 999px;
    border: 0;
    padding: 0;
    background: color-mix(in oklch, var(--foreground) 45%, transparent);
    cursor: pointer;
  }

  .dots button[aria-selected="true"] {
    background: var(--primary);
  }
</style>
