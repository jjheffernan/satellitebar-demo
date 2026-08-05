<script>
  import BeholdWidget from "@behold/svelte";

  let { feedId = "" } = $props();
</script>

{#if feedId}
  <div class="instagram-feed">
    <BeholdWidget {feedId} />
  </div>
{/if}

<style>
  .instagram-feed {
    width: 100%;
    height: 100%;
    min-height: inherit;
  }

  .instagram-feed :global(behold-widget) {
    display: block;
    width: 100%;
    min-height: 100%;
  }
</style>
