<script>
  import { createAuthClient } from "better-auth/client";
  import {
    Calendar,
    Editor,
    WillowDark,
    parseICal,
    serializeICal,
  } from "@svar-ui/svelte-calendar";

  const authClient = createAuthClient();

  let session = $state(null);
  let ready = $state(false);
  let busy = $state(false);
  let error = $state("");
  let status = $state("");
  let forbidden = $state(false);
  let events = $state([]);
  let calendarApi = $state(null);
  let icsInput = $state(null);
  let jsonInput = $state(null);

  function revive(list = []) {
    return list.map((event) => ({
      ...event,
      start: event.start instanceof Date ? event.start : new Date(event.start),
      end: event.end instanceof Date ? event.end : new Date(event.end),
      allDay: Boolean(event.allDay),
    }));
  }

  function serializeForApi(list = []) {
    return list.map((event) => ({
      id: event.id,
      text: event.text,
      description: event.description || "",
      place: event.place || "",
      href: event.href || "/calendar",
      start: event.start instanceof Date ? event.start.toISOString() : event.start,
      end: event.end instanceof Date ? event.end.toISOString() : event.end,
      allDay: Boolean(event.allDay),
      images: Array.isArray(event.images) ? event.images : [],
      imageAlt: event.imageAlt || "",
    }));
  }

  async function loadSession() {
    try {
      const result = await authClient.getSession();
      session = result?.data ?? null;
    } catch {
      session = null;
    }
    ready = true;
  }

  async function loadEvents() {
    error = "";
    forbidden = false;
    try {
      const res = await fetch("/api/calendar/admin", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) {
        forbidden = true;
        events = [];
        return;
      }
      if (res.status === 401) {
        events = [];
        return;
      }
      if (!res.ok) {
        error =
          data.error === "accounts_not_configured"
            ? "Accounts / database not configured on this deploy."
            : "Could not load calendar events.";
        return;
      }
      events = revive(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      error = "Network error loading calendar.";
      console.error(err);
    }
  }

  $effect(() => {
    let cancelled = false;
    loadSession().then(() => {
      if (!cancelled && session?.user) return loadEvents();
    });
    return () => {
      cancelled = true;
    };
  });

  async function signInGoogle() {
    busy = true;
    error = "";
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin/calendar",
      });
    } catch (err) {
      error = "Sign-in unavailable.";
      busy = false;
      console.error(err);
    }
  }

  function liveEvents() {
    if (calendarApi?.getEvents) return calendarApi.getEvents();
    return events;
  }

  async function saveToServer() {
    busy = true;
    error = "";
    status = "";
    try {
      const payload = serializeForApi(liveEvents());
      const res = await fetch("/api/calendar/admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ events: payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        error = data.error === "forbidden" ? "Not an admin account." : "Save failed.";
        return;
      }
      status = `Saved ${data.count ?? payload.length} events.`;
      await loadEvents();
    } catch (err) {
      error = "Network error saving.";
      console.error(err);
    } finally {
      busy = false;
    }
  }

  async function importParsed(list) {
    busy = true;
    error = "";
    status = "";
    try {
      const payload = serializeForApi(list);
      const res = await fetch("/api/calendar/admin/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ events: payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        error = "Import failed.";
        return;
      }
      status = `Imported ${data.count ?? payload.length} events.`;
      await loadEvents();
    } catch (err) {
      error = "Network error importing.";
      console.error(err);
    } finally {
      busy = false;
    }
  }

  function onIcsFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseICal(String(reader.result || ""));
        importParsed(parsed);
      } catch (err) {
        error = "Could not parse .ics file.";
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function onJsonFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result || "[]"));
        const list = Array.isArray(raw) ? raw : raw.events;
        if (!Array.isArray(list)) throw new Error("invalid");
        importParsed(revive(list));
      } catch (err) {
        error = "Could not parse JSON file.";
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function download(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportIcs() {
    const ics = serializeICal(liveEvents());
    download("satellitebar-calendar.ics", new Blob([ics], { type: "text/calendar" }));
    status = "Exported .ics";
  }

  function exportJson() {
    const payload = serializeForApi(liveEvents());
    download(
      "satellitebar-calendar.json",
      new Blob([JSON.stringify({ events: payload }, null, 2)], {
        type: "application/json",
      }),
    );
    status = "Exported JSON";
  }
</script>

{#if !ready}
  <p class="cal-admin__msg">Loading…</p>
{:else if !session?.user}
  <div class="cal-admin__gate">
    <p>Sign in with an admin Google account to manage the public schedule.</p>
    <button type="button" onclick={signInGoogle} disabled={busy}>Continue with Google</button>
    {#if error}
      <p class="cal-admin__error">{error}</p>
    {/if}
  </div>
{:else if forbidden}
  <p class="cal-admin__error">
    Signed in as {session.user.email}, but that address is not in <code>ADMIN_EMAILS</code>.
  </p>
{:else}
  <div class="cal-admin">
    <div class="cal-admin__toolbar">
      <button type="button" onclick={saveToServer} disabled={busy}>Save to server</button>
      <button type="button" onclick={() => icsInput?.click()} disabled={busy}>Import .ics</button>
      <button type="button" onclick={() => jsonInput?.click()} disabled={busy}>Import JSON</button>
      <button type="button" onclick={exportIcs} disabled={busy}>Export .ics</button>
      <button type="button" onclick={exportJson} disabled={busy}>Export JSON</button>
      <input
        bind:this={icsInput}
        class="cal-admin__file"
        type="file"
        accept=".ics,text/calendar"
        onchange={onIcsFile}
      />
      <input
        bind:this={jsonInput}
        class="cal-admin__file"
        type="file"
        accept="application/json,.json"
        onchange={onJsonFile}
      />
    </div>

    {#if error}
      <p class="cal-admin__error">{error}</p>
    {/if}
    {#if status}
      <p class="cal-admin__status">{status}</p>
    {/if}

    <p class="cal-admin__hint">
      Edit in the calendar, then <strong>Save to server</strong> so the public site updates without a
      rebuild. Import replaces all events.
    </p>

    <div class="cal-admin__stage">
      <WillowDark>
        <Calendar bind:this={calendarApi} {events} date={new Date()} view="month" />
        {#if calendarApi}
          <Editor api={calendarApi} />
        {/if}
      </WillowDark>
    </div>
  </div>
{/if}

<style>
  .cal-admin {
    display: grid;
    gap: 0.75rem;
  }

  .cal-admin__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .cal-admin__toolbar button,
  .cal-admin__gate button {
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.45rem 0.7rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: color-mix(in oklch, var(--muted) 35%, transparent);
    color: var(--foreground);
    cursor: pointer;
  }

  .cal-admin__toolbar button:first-child,
  .cal-admin__gate button {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
  }

  .cal-admin__toolbar button:disabled,
  .cal-admin__gate button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cal-admin__file {
    display: none;
  }

  .cal-admin__msg,
  .cal-admin__hint,
  .cal-admin__status,
  .cal-admin__gate p {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .cal-admin__error {
    margin: 0;
    color: color-mix(in oklch, var(--primary) 35%, #c44);
    font-size: 0.9rem;
  }

  .cal-admin__gate {
    display: grid;
    gap: 0.75rem;
    max-width: 28rem;
  }

  .cal-admin__stage {
    min-height: 32rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: color-mix(in oklch, var(--muted) 20%, transparent);
  }

  .cal-admin__stage :global(.wx-willow-dark-theme),
  .cal-admin__stage :global(.wx-willow-theme) {
    min-height: 32rem;
  }
</style>
