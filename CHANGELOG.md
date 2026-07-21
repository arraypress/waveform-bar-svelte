# Changelog

All notable changes to `@arraypress/waveform-bar-svelte` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.3.0] — 2026-07-22

### Added

- **`crossOrigin` config key.** Added to `WaveformBarConfig` and forwarded
  verbatim to `window.WaveformBar.init()`. Requires
  `@arraypress/waveform-bar@^1.11.0` for it to reach the embedded player.

## [0.2.0] — 2026-07-05

### Added

- Accept the new localizable player-string keys — `seekValueText`,
  `playPauseLabel`, `speedLabel`, `artworkAlt`, and `unknownTrackText` — in
  the bar config; they are forwarded to the embedded player. Requires
  `@arraypress/waveform-bar@^1.10.0`.

## [0.1.0] — Unreleased

Initial release.

### Added

- `<WaveformBar>` — singleton mount (Svelte 5 runes) for the persistent
  bottom bar. Render once in your root layout. A browser-only `$effect`
  dynamically imports `@arraypress/waveform-bar` (SSR-safe) and calls
  `window.WaveformBar.init(config)`; a `$derived` config key re-inits only
  when the config's structural shape (or `persist`) changes; the bar
  element is relocated into a persist host `<div>`; `destroy()` is called
  on unmount. `config`, `persist`, `hostId` props; `class` / attributes
  fall through to the host (base class `wb-host`).
- `<WaveformBarTrigger>` — polymorphic (`as="button" | "a" | "div" |
  "span"` via `<svelte:element>`, default `button`) click trigger that
  emits the `data-wb-*` attribute contract the core library scans for.
  Maps track-data props (`url`, `id`, `title`, `artist`, `album`,
  `artwork`, `link`, `duration`, `bpm`, `musicalKey`, `meta`, `waveform`,
  `markers`, `favorited`, `inCart`) to attributes (arrays JSON-encoded;
  absent props emit no attribute). `mode="play" | "queue"`, `href` (for
  `as="a"`), `noDefaultIcons`. Renders default play/pause SVGs unless
  children are slotted. Auto-generates an `aria-label` from `title`.
  `class`, native listeners (`onclick`), and other attributes fall through
  via `...rest`; the base class `wb-icon-swap` is always applied.
- No lifecycle callback props — the bar dispatches every state change as a
  bubbling `waveformbar:*` `CustomEvent`; listen with `addEventListener`.
- Public types mirroring the core surface: `WaveformBarConfig`,
  `WaveformBarProps`, `WaveformBarTriggerProps`, `WaveformBarTrackData`,
  `WaveformBarMarker`, `WaveformBarActions`, `WaveformBarAction`,
  `WaveformBarTheme`, `RepeatMode`, `TriggerMode`, `WaveformStyle`.
- Built with `svelte-package` (`dist/` ships the preprocessed `.svelte` +
  generated `.d.ts`). Svelte + the core libraries are peer dependencies.
- Vitest test suite (jsdom + `@testing-library/svelte`, 12 tests) covering
  the singleton's host render + `init` / re-init / no-churn / `destroy`
  lifecycle, and the trigger's `data-wb-*` contract, polymorphism, modes,
  default-icon handling, class merge, and click forwarding.
