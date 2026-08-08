<script>
  let { events = [] } = $props();

  const sorted = $derived(
    [...events].sort((a, b) => String(a.date).localeCompare(String(b.date))),
  );

  const monthKeys = $derived(
    [...new Set(sorted.map((e) => String(e.date).slice(0, 7)))].sort(),
  );

  let monthIndex = $state(0);
  let primed = $state(false);

  $effect(() => {
    if (primed || !monthKeys.length) return;
    const nowKey = new Date().toISOString().slice(0, 7);
    const upcoming = monthKeys.findIndex((key) => key >= nowKey);
    monthIndex = upcoming >= 0 ? upcoming : monthKeys.length - 1;
    primed = true;
  });

  const activeMonth = $derived(monthKeys[monthIndex] ?? monthKeys[0] ?? "");

  const monthLabel = $derived.by(() => {
    if (!activeMonth) return "";
    const [y, m] = activeMonth.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  });

  const monthEvents = $derived(sorted.filter((e) => String(e.date).startsWith(activeMonth)));

  const daysInMonth = $derived.by(() => {
    if (!activeMonth) return 0;
    const [y, m] = activeMonth.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  });

  const startWeekday = $derived.by(() => {
    if (!activeMonth) return 0;
    const [y, m] = activeMonth.split("-").map(Number);
    return new Date(y, m - 1, 1).getDay();
  });

  const byDay = $derived.by(() => {
    const map = new Map();
    for (const event of monthEvents) {
      const day = Number(String(event.date).slice(8, 10));
      const list = map.get(day) ?? [];
      list.push(event);
      map.set(day, list);
    }
    return map;
  });

  const cells = $derived.by(() => {
    const out = [];
    for (let i = 0; i < startWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push({ day: d, events: byDay.get(d) ?? [] });
    }
    return out;
  });

  function prevMonth() {
    monthIndex = Math.max(0, monthIndex - 1);
  }

  function nextMonth() {
    monthIndex = Math.min(monthKeys.length - 1, monthIndex + 1);
  }

  function formatDate(iso) {
    const [y, m, d] = String(iso).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

{#if sorted.length}
  <div class="full-cal">
    <div class="full-cal__toolbar">
      <button type="button" onclick={prevMonth} disabled={monthIndex <= 0} aria-label="Previous month">
        ←
      </button>
      <h2>{monthLabel}</h2>
      <button
        type="button"
        onclick={nextMonth}
        disabled={monthIndex >= monthKeys.length - 1}
        aria-label="Next month"
      >
        →
      </button>
    </div>

    <div class="full-cal__grid" role="grid" aria-label={`Calendar for ${monthLabel}`}>
      <div class="full-cal__dow" role="row">
        {#each ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as dow}
          <span role="columnheader">{dow}</span>
        {/each}
      </div>
      <div class="full-cal__days" role="rowgroup">
        {#each cells as cell, i (i)}
          {#if cell}
            <div
              class="day"
              class:day--busy={cell.events.length > 0}
              role="gridcell"
              aria-label={`${monthLabel} ${cell.day}${cell.events.length ? `, ${cell.events.length} event` : ""}`}
            >
              <span class="day__num">{cell.day}</span>
              {#if cell.events.length}
                <ul class="day__events">
                  {#each cell.events as event}
                    <li>
                      <a href={event.href} title={event.title}>{event.title}</a>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {:else}
            <div class="day day--empty" role="gridcell" aria-hidden="true"></div>
          {/if}
        {/each}
      </div>
    </div>

    <section class="full-cal__list" aria-labelledby="cal-list-heading">
      <h3 id="cal-list-heading">
        {monthEvents.length ? `Events in ${monthLabel}` : "All dates"}
      </h3>
      <ul>
        {#each monthEvents.length ? monthEvents : sorted as event}
          <li>
            <a href={event.href}>
              <span class="date">{formatDate(event.date)}</span>
              <span class="title">{event.title}</span>
              <span class="place">{event.place}</span>
              {#if event.summary}
                <span class="summary">{event.summary}</span>
              {/if}
            </a>
            {#if event.images?.length}
              <div class="photos" role="group" aria-label={`Photos from ${event.title}`}>
                {#each event.images as src, i}
                  <img
                    src={src}
                    alt={`${event.imageAlt ?? event.title} — ${i + 1} of ${event.images.length}`}
                    width="720"
                    height="960"
                    loading="lazy"
                    decoding="async"
                  />
                {/each}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  </div>
{:else}
  <p class="full-cal__empty">No public events on the calendar yet. <a href="/book">Check availability</a> for a private date.</p>
{/if}

<style>
  .full-cal {
    display: grid;
    gap: 1.35rem;
  }

  .full-cal__toolbar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.75rem;
  }

  .full-cal__toolbar h2 {
    margin: 0;
    text-align: center;
    font-size: clamp(1.2rem, 3vw, 1.55rem);
  }

  .full-cal__toolbar button {
    min-width: 2.75rem;
    min-height: 2.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: color-mix(in oklch, var(--muted) 35%, transparent);
    color: var(--foreground);
    font: inherit;
    font-size: 1.1rem;
    cursor: pointer;
  }

  .full-cal__toolbar button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .full-cal__toolbar button:not(:disabled):hover {
    border-color: color-mix(in oklch, var(--primary) 45%, var(--border));
  }

  .full-cal__dow,
  .full-cal__days {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .full-cal__dow span {
    padding: 0.35rem 0.2rem;
    text-align: center;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }

  .full-cal__days {
    gap: 0.25rem;
  }

  .day {
    min-height: 4.5rem;
    padding: 0.35rem;
    border: 1px solid var(--border);
    background: color-mix(in oklch, var(--muted) 22%, transparent);
  }

  .day--empty {
    background: transparent;
    border-color: transparent;
  }

  .day--busy {
    border-color: color-mix(in oklch, var(--primary) 40%, var(--border));
    background: color-mix(in oklch, var(--primary) 8%, var(--card));
  }

  .day__num {
    display: block;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--muted-foreground);
  }

  .day--busy .day__num {
    color: var(--primary);
  }

  .day__events {
    list-style: none;
    margin: 0.25rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.2rem;
  }

  .day__events a {
    display: block;
    text-decoration: none;
    color: var(--foreground);
    font-size: 0.68rem;
    font-weight: 600;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .day__events a:hover {
    color: var(--primary);
  }

  .full-cal__list h3 {
    margin: 0 0 0.55rem;
    font-size: 1.05rem;
  }

  .full-cal__list ul {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--border);
  }

  .full-cal__list li {
    border-bottom: 1px solid var(--border);
  }

  .full-cal__list a {
    display: grid;
    gap: 0.15rem;
    padding: 0.85rem 0;
    text-decoration: none;
    color: inherit;
  }

  .date {
    color: var(--primary);
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .title {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 1.05rem;
  }

  .place {
    color: var(--muted-foreground);
    font-size: 0.85rem;
  }

  .summary {
    margin-top: 0.15rem;
    color: var(--muted-foreground);
    font-size: 0.88rem;
    line-height: 1.4;
    max-width: 40rem;
  }

  .photos {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(7.5rem, 28vw);
    gap: 0.4rem;
    overflow-x: auto;
    padding: 0 0 0.85rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .photos img {
    display: block;
    width: 100%;
    height: 10.5rem;
    object-fit: cover;
    scroll-snap-align: start;
    border: 0;
  }

  .full-cal__empty {
    color: var(--muted-foreground);
  }

  .full-cal__empty a {
    color: var(--primary);
    font-weight: 600;
  }

  @media (min-width: 720px) {
    .day {
      min-height: 6.5rem;
      padding: 0.45rem;
    }

    .day__events a {
      font-size: 0.75rem;
      white-space: normal;
    }

    .photos {
      grid-auto-columns: minmax(9rem, 11rem);
    }

    .photos img {
      height: 12.5rem;
    }
  }
</style>
