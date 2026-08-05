<script>
  import { onMount } from "svelte";

  let {
    instagram = "",
    facebook = "",
    twitter = "",
  } = $props();

  function handleFromUrl(url = "") {
    try {
      return new URL(url).pathname.replace(/\//g, "") || "";
    } catch {
      return "";
    }
  }

  const igHandle = $derived(handleFromUrl(instagram));
  const xHandle = $derived(handleFromUrl(twitter));

  const facebookEmbed = $derived(
    facebook
      ? `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebook)}&tabs=timeline&width=500&height=520&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`
      : "",
  );

  onMount(() => {
    if (!twitter) return;
    const existing = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
    if (existing) {
      window.twttr?.widgets?.load?.();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);
  });
</script>

<div class="embeds">
  {#if twitter}
    <section class="embed" aria-labelledby="embed-x">
      <h2 id="embed-x">X</h2>
      <p class="embed__link">
        <a href={twitter} rel="noopener noreferrer" target="_blank">@{xHandle || "profile"}</a>
      </p>
      <div class="embed__frame embed__frame--x">
        <a
          class="twitter-timeline"
          data-height="520"
          data-chrome="nofooter transparent"
          href={twitter}
        >
          Posts from @{xHandle || "profile"}
        </a>
      </div>
    </section>
  {/if}

  {#if instagram}
    <section class="embed" aria-labelledby="embed-ig">
      <h2 id="embed-ig">Instagram</h2>
      <p class="embed__link">
        <a href={instagram} rel="noopener noreferrer" target="_blank">@{igHandle || "profile"}</a>
      </p>
      <p class="embed__fallback">
        Live feed embed is planned — follow @{igHandle || "us"} on Instagram meanwhile.
      </p>
    </section>
  {/if}

  {#if facebook}
    <section class="embed" aria-labelledby="embed-fb">
      <h2 id="embed-fb">Facebook</h2>
      <p class="embed__link">
        <a href={facebook} rel="noopener noreferrer" target="_blank">facebook.com/{handleFromUrl(facebook) || "page"}</a>
      </p>
      <div class="embed__frame embed__frame--fb">
        <iframe
          title="Facebook page"
          src={facebookEmbed}
          width="100%"
          height="520"
          style="border:none;overflow:hidden"
          scrolling="no"
          frameborder="0"
          allowfullscreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        ></iframe>
      </div>
    </section>
  {/if}
</div>

<style>
  .embeds {
    display: grid;
    gap: 1.25rem;
    margin-top: 1.5rem;
  }

  @media (min-width: 960px) {
    .embeds {
      grid-template-columns: repeat(3, 1fr);
      align-items: start;
    }
  }

  .embed h2 {
    margin: 0 0 0.25rem;
    font-size: 1.05rem;
  }

  .embed__link {
    margin: 0 0 0.65rem;
    font-size: 0.85rem;
  }

  .embed__link a {
    color: var(--primary);
    text-decoration: none;
  }

  .embed__frame {
    width: 100%;
    min-height: 24rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--muted) 35%, transparent);
    overflow: clip;
  }

  .embed__frame--ig {
    min-height: 24rem;
  }

  .embed__frame--x,
  .embed__frame--fb {
    padding: 0.35rem;
  }

  .embed__frame--fb iframe {
    display: block;
    width: 100%;
    max-width: 100%;
  }

  .embed__fallback {
    margin: 0;
    padding: 1rem;
    color: var(--muted-foreground);
    font-size: 0.85rem;
    line-height: 1.4;
    border: 1px dashed var(--border);
    border-radius: var(--radius-md);
  }

  .embed__fallback code {
    font-size: 0.8em;
  }
</style>
