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

  function profilePermalink(url = "") {
    if (!url) return "";
    const base = url.endsWith("/") ? url : `${url}/`;
    return `${base}?utm_source=ig_embed&utm_campaign=loading`;
  }

  const igHandle = $derived(handleFromUrl(instagram));
  const xHandle = $derived(handleFromUrl(twitter));
  const igPermalink = $derived(profilePermalink(instagram));

  const facebookEmbed = $derived(
    facebook
      ? `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebook)}&tabs=timeline&width=500&height=520&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`
      : "",
  );

  onMount(() => {
    if (twitter) {
      const existing = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
      if (existing) {
        window.twttr?.widgets?.load?.();
      } else {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.body.appendChild(script);
      }
    }

    if (instagram) {
      const boot = () => window.instgrm?.Embeds?.process?.();
      const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
      if (existing) {
        boot();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = boot;
      document.body.appendChild(script);
    }
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
      <div class="embed__frame embed__frame--ig">
        <blockquote
          class="instagram-media"
          data-instgrm-permalink={igPermalink}
          data-instgrm-version="14"
          style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:1px; max-width:540px; min-width:326px; padding:0; width:calc(100% - 2px);"
        >
          <div style="padding:16px;">
            <a href={igPermalink} style="background:#FFF; line-height:0; padding:0; text-align:center; text-decoration:none; width:100%;" target="_blank" rel="noopener noreferrer">
              <div style="display:flex; flex-direction:row; align-items:center;">
                <div style="background-color:#F4F4F4; border-radius:50%; flex-grow:0; height:40px; margin-right:14px; width:40px;"></div>
                <div style="display:flex; flex-direction:column; flex-grow:1; justify-content:center;">
                  <div style="background-color:#F4F4F4; border-radius:4px; flex-grow:0; height:14px; margin-bottom:6px; width:100px;"></div>
                  <div style="background-color:#F4F4F4; border-radius:4px; flex-grow:0; height:14px; width:60px;"></div>
                </div>
              </div>
              <div style="padding:19% 0;"></div>
              <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-weight:550; line-height:18px; text-align:center;">
                View this profile on Instagram
              </div>
            </a>
            <p style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin:8px 0 0; text-align:center;">
              <a href={igPermalink} style="color:#c9c8cd;" target="_blank" rel="noopener noreferrer">@{igHandle || "profile"}</a>
              · Instagram photos and videos
            </p>
          </div>
        </blockquote>
      </div>
    </section>
  {/if}

  {#if facebook}
    <section class="embed" aria-labelledby="embed-fb">
      <h2 id="embed-fb">Facebook</h2>
      <p class="embed__link">
        <a href={facebook} rel="noopener noreferrer" target="_blank"
          >facebook.com/{handleFromUrl(facebook) || "page"}</a
        >
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
    padding: 0.35rem;
    display: flex;
    justify-content: center;
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

  :global(.instagram-media) {
    margin: 0 auto !important;
  }
</style>
