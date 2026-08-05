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
    margin: 1rem 0 0;
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--card);
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  figcaption {
    position: absolute;
    left: 0.75rem;
    bottom: 0.75rem;
    padding: 0.25rem 0.55rem;
    border-radius: var(--radius-sm);
    background: color-mix(in oklch, var(--background) 75%, transparent);
    font-size: 0.8rem;
  }

  .dots {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    display: flex;
    gap: 0.35rem;
  }

  .dots button {
    width: 0.55rem;
    height: 0.55rem;
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
