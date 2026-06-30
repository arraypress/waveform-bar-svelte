# @arraypress/waveform-bar-svelte

Svelte 5 components for [`@arraypress/waveform-bar`](https://github.com/arraypress/waveform-bar) — a persistent bottom-bar audio player. Two components: a singleton `<WaveformBar>` you render once, and a polymorphic `<WaveformBarTrigger>` you drop anywhere you want a clickable "play this track" element. Built with runes.

The core library stays a zero-dependency vanilla-JS package that works anywhere a `<script>` tag does. This package adds the framework-native ergonomics Svelte developers expect.

```svelte
<script lang="ts">
  import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-svelte';
</script>

<!-- render ONCE in your root layout -->
<WaveformBar config={{ persist: true, continuous: true }} />

<!-- drop triggers anywhere -->
<WaveformBarTrigger url="/audio/track.mp3" title="My Track" artist="The Artist" />
```

## Installation

```bash
npm install @arraypress/waveform-bar-svelte @arraypress/waveform-bar @arraypress/waveform-player svelte
```

`svelte` (^5), `@arraypress/waveform-bar` (^1.3), and `@arraypress/waveform-player` (^1.7) are peer dependencies.

## Setup

The bar has a strict runtime dependency on the core player. Load both libraries' JS + CSS **once** in your app entry (e.g. SvelteKit `+layout.svelte`) — **order matters** (the player installs `window.WaveformPlayer`, which the bar needs):

```ts
import '@arraypress/waveform-player/dist/waveform-player.css';
import '@arraypress/waveform-bar/dist/waveform-bar.css';
import '@arraypress/waveform-player'; // sets window.WaveformPlayer
import '@arraypress/waveform-bar';    // sets window.WaveformBar
```

The wrapper imports the core dynamically inside a `$effect`, so SSR / SvelteKit prerendering doesn't trip over the browser-only audio APIs.

## `<WaveformBar>` — the singleton

Render exactly **once** in your root layout. It mounts a persist host, runs `init(config)`, and tears down on unmount.

```svelte
<WaveformBar
  hostId="my-app-bar"
  config={{
    persist: true,
    continuous: true,
    showQueue: true,
    maxMeta: 1,
    storageKey: 'my-app-bar',
    actions: {
      favorite: { endpoint: '/api/favorites' },
      cart:     { endpoint: '/api/cart' },
    },
  }}
/>
```

| Prop     | Type               | Default              |
| -------- | ------------------ | -------------------- |
| `config` | `WaveformBarConfig`| —                    |
| `persist`| `boolean`          | `true`               |
| `hostId` | `string`           | `'waveform-bar-host'`|

`init()` re-runs only when the config's structural shape changes (compared via a derived `JSON.stringify` key), so passing a fresh object with the same shape on every render is safe. `class` / attributes fall through to the host `<div>` (base class `wb-host`).

> **Events.** The bar dispatches every state change as a bubbling `waveformbar:*` `CustomEvent` (e.g. `waveformbar:play`, `waveformbar:trackchange`). Listen with `addEventListener` — there are no callback props (a fresh inline function each render would needlessly re-init the bar).

## `<WaveformBarTrigger>` — the trigger

A polymorphic clickable element that tells the bar to play / queue a track via the `data-wb-*` attribute contract. The core library handles click delegation automatically.

```svelte
<!-- default: a <button> with play/pause icons -->
<WaveformBarTrigger
  url="/audio/track.mp3"
  id="track-42"
  title="Midnight Dreams"
  artist="The Wavelength"
  artwork="/img/cover.jpg"
/>

<!-- queue mode, custom content -->
<WaveformBarTrigger mode="queue" url="/audio/track.mp3" title="Midnight Dreams">
  + Add to queue
</WaveformBarTrigger>

<!-- wrap a whole card (as="div"), suppress the default icons -->
<WaveformBarTrigger as="div" url={track.url} title={track.title} noDefaultIcons>
  <article class="product-card">…</article>
</WaveformBarTrigger>
```

Track-data props (`url`, `id`, `title`, `artist`, `album`, `artwork`, `link`, `duration`, `bpm`, `musicalKey`, `meta`, `waveform`, `markers`, `favorited`, `inCart`) map 1:1 to `data-wb-*` attributes — arrays are JSON-encoded, and absent props emit no attribute. Plus:

| Prop             | Type                                  | Default    |
| ---------------- | ------------------------------------- | ---------- |
| `mode`           | `'play' \| 'queue'`                   | `'play'`   |
| `as`             | `'button' \| 'a' \| 'div' \| 'span'`  | `'button'` |
| `href`           | `string` (for `as="a"`)               | —          |
| `noDefaultIcons` | `boolean`                             | `false`    |

`class`, native listeners (`onclick`), and any other DOM attributes fall through to the rendered element; the base class `wb-icon-swap` is always applied, and an `aria-label` is auto-generated from `title` when you don't pass one.

## TypeScript

```ts
import type {
  WaveformBarConfig,
  WaveformBarProps,
  WaveformBarTriggerProps,
  WaveformBarTrackData,
  WaveformBarMarker,
  RepeatMode,
  TriggerMode,
  WaveformStyle,
} from '@arraypress/waveform-bar-svelte';
```

The package ships `.svelte` + `.d.ts` (generated by `svelte-package`).

## Testing

```bash
npm test          # one-shot
npm run typecheck  # svelte-check
npm run build      # svelte-package → dist/
```

The core library is mocked at the module boundary (jsdom has no Web Audio API).

## License

MIT © ArrayPress
