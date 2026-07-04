/**
 * @module types
 * @description
 * Public TypeScript types for `@arraypress/waveform-bar-svelte`.
 *
 * Two component shapes:
 *
 *   1. `<WaveformBar>`         — the persistent bottom-bar singleton.
 *                                Takes a `config` object (every option
 *                                `window.WaveformBar.init()` accepts).
 *   2. `<WaveformBarTrigger>`  — polymorphic click trigger. Renders a
 *                                `<button>` by default; emits the
 *                                `data-wb-*` attribute contract the core
 *                                library scans for at runtime.
 *
 * Prop names match the library option / attribute names 1:1 (camelCase).
 * The components handle the conversion (init-time JSON for the bar,
 * `data-wb-*` attributes for the trigger).
 *
 * Callbacks are deliberately NOT exposed as props. The core library
 * dispatches every state change as a bubbling `waveformbar:*`
 * `CustomEvent` — listen via `addEventListener` in your own code, which
 * is framework-agnostic and avoids re-init churn.
 *
 * @see {@link https://github.com/arraypress/waveform-bar} — core library
 */

/* Re-export the WaveformStyle alias for ergonomic consumer imports. */
export type { WaveformStyle } from './waveform-style.js';
import type { WaveformStyle } from './waveform-style.js';

/** Visual theme used by the bar. `null` auto-detects from the page. */
export type WaveformBarTheme = 'dark' | 'light' | null;

/**
 * Repeat-mode cycle position.
 *
 * - `off` — play the queue once, then stop
 * - `all` — loop the entire queue
 * - `one` — loop the current track indefinitely
 */
export type RepeatMode = 'off' | 'all' | 'one';

/**
 * Trigger behaviour for `<WaveformBarTrigger>`.
 *
 * - `play`  — (default) immediate play.
 * - `queue` — append to the queue without changing the current track.
 */
export type TriggerMode = 'play' | 'queue';

/**
 * A clickable DJ-mode marker within a single track. Markers fire as
 * playback crosses each `time`; the bar updates its displayed metadata
 * to the marker's values.
 */
export interface WaveformBarMarker {
	time: number;
	label: string;
	title?: string;
	artist?: string;
	artwork?: string;
	bpm?: string | number;
	key?: string;
	color?: string;
}

/**
 * Server-side action endpoint config for favourite / cart toggles.
 * `endpoint` is a URL string (the library `fetch()`es it) or a function
 * you provide to intercept the request in-browser.
 */
export interface WaveformBarAction {
	endpoint: string | ((payload: Record<string, unknown>) => void);
	method?: string;
	headers?: Record<string, string>;
}

export interface WaveformBarActions {
	favorite?: WaveformBarAction;
	cart?: WaveformBarAction;
}

/**
 * Full configuration object for the persistent bar. Mirrors the options
 * accepted by `window.WaveformBar.init(...)`. Every field is optional —
 * pass only the keys you want to override.
 */
export interface WaveformBarConfig {
	// ── Persistence + behaviour ────────────────────────────────────────
	persist?: boolean;
	autoResume?: boolean;
	continuous?: boolean;
	repeat?: RepeatMode;
	// ── UI toggles ─────────────────────────────────────────────────────
	showQueue?: boolean;
	showPrevNext?: boolean;
	showRepeat?: boolean;
	showVolume?: boolean;
	showMute?: boolean;
	showTime?: boolean;
	showTrackLink?: boolean;
	showMeta?: boolean;
	maxMeta?: number;
	// ── Layout + docking ───────────────────────────────────────────────
	wide?: boolean;
	position?: 'bottom' | 'top';
	collapsible?: boolean;
	/** Display mode: `'waveform'` (default layout + waveform, width-adjustable) or `'classic'` (Spotify-style centre layout + seekbar, full-width). @default 'waveform' */
	mode?: 'waveform' | 'classic';
	/** Show a shuffle toggle button in the transport cluster. @default false */
	showShuffle?: boolean;
	/** Start with shuffle (random queue advance) on. @default false */
	shuffle?: boolean;
	// ── Defaults + theming ─────────────────────────────────────────────
	defaultArtwork?: string | null;
	theme?: WaveformBarTheme;
	// ── Waveform visualisation ─────────────────────────────────────────
	waveform?: boolean;
	waveformStyle?: WaveformStyle;
	waveformHeight?: number;
	barWidth?: number;
	barSpacing?: number;
	waveformColor?: string | null;
	progressColor?: string | null;
	markerColor?: string;
	// ── Sharing + errors ───────────────────────────────────────────────
	share?: boolean;
	shareParam?: string;
	errorText?: string | null;
	// ── Localizable player strings (forwarded to the embedded player) ──
	/** Seek slider spoken `aria-valuetext` template — `%1$s` current, `%2$s` total. */
	seekValueText?: string | null;
	/** Media Session title fallback when a track has no title. */
	unknownTrackText?: string | null;
	/** Play button `aria-label`. Governs player UI the bar hides; forwarded for completeness. */
	playPauseLabel?: string | null;
	/** Speed control `aria-label`. Hidden UI; forwarded for completeness. */
	speedLabel?: string | null;
	/** Artwork image alt text. Hidden UI; forwarded for completeness. */
	artworkAlt?: string | null;
	// ── Volume + persistence keys ──────────────────────────────────────
	volume?: number;
	storageKey?: string;
	// ── Server-side actions ────────────────────────────────────────────
	actions?: WaveformBarActions | null;
}

/**
 * Props accepted by `<WaveformBar>` — render this **once** in your root
 * layout. `class`, `style`, and other attributes fall through to the
 * persist host `<div>` (base class `wb-host`).
 */
export interface WaveformBarProps {
	/** Bar configuration. Pass any subset of `WaveformBarConfig`. */
	config?: WaveformBarConfig;
	/** Relocate the bar into the persist host so it survives routing. @default true */
	persist?: boolean;
	/** DOM `id` for the persist host. @default 'waveform-bar-host' */
	hostId?: string;
}

/**
 * Track metadata the bar reads from `<WaveformBarTrigger>`. Every field
 * is optional except `url` (the unique identity / play target).
 */
export interface WaveformBarTrackData {
	url?: string;
	id?: string;
	title?: string;
	artist?: string;
	album?: string;
	artwork?: string;
	link?: string;
	duration?: string | number;
	bpm?: string | number;
	musicalKey?: string;
	meta?: string[];
	waveform?: number[] | string;
	markers?: WaveformBarMarker[];
	favorited?: boolean;
	inCart?: boolean;
}

/**
 * Props accepted by `<WaveformBarTrigger>` (beyond the track-data
 * fields). The component is polymorphic via `as` — defaults to
 * `<button>` for free keyboard focus + Space/Enter activation.
 *
 * `class`, native listeners (`onclick`), and other DOM attributes fall
 * through to the rendered element; the component applies its own
 * `data-wb-*` contract last so it always wins.
 */
export interface WaveformBarTriggerProps extends WaveformBarTrackData {
	/** Whether clicking plays the track (`'play'`) or queues it (`'queue'`). @default 'play' */
	mode?: TriggerMode;
	/** HTML tag for the rendered element. @default 'button' */
	as?: 'button' | 'a' | 'div' | 'span';
	/** `href` when `as="a"`. Ignored otherwise. */
	href?: string;
	/** Suppress the default play / pause SVGs (slotted children still render). @default false */
	noDefaultIcons?: boolean;
}
