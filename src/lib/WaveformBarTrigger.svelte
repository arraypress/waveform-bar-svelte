<!--
  WaveformBarTrigger.svelte
  -------------------------

  Polymorphic Svelte trigger that wires an element up to the persistent
  `<WaveformBar>`. Emits the `data-wb-*` attribute contract the core
  library scans for at runtime — the library handles its own click
  delegation, so we just put the attributes on the element.

  ## What it renders

  Defaults to a `<button>` (keyboard focus, Space / Enter activation,
  implicit `role="button"`). Override via `as` ('a' | 'div' | 'span').

  ## Default content

  Without slotted children, renders two SVGs the library's `.wb-icon-swap`
  CSS toggles (`.wb-show-play` / `.wb-show-pause`). Provide children to
  replace them, or set `noDefaultIcons` to suppress them.

  `class`, native listeners (`onclick`), and any other DOM attributes
  fall through via `...rest`; the component applies its own `data-wb-*`
  contract last so it always wins. An `aria-label` is auto-generated from
  `title` when not supplied.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { TriggerMode, WaveformBarMarker } from './types.js';

	type Props = {
		mode?: TriggerMode;
		as?: 'button' | 'a' | 'div' | 'span';
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
		href?: string;
		noDefaultIcons?: boolean;
		children?: Snippet;
	} & HTMLAttributes<HTMLElement>;

	let {
		mode = 'play',
		as = 'button',
		url,
		id,
		title,
		artist,
		album,
		artwork,
		link,
		duration,
		bpm,
		musicalKey,
		meta,
		waveform,
		markers,
		favorited,
		inCart,
		href,
		noDefaultIcons = false,
		children,
		class: className = '',
		'aria-label': ariaLabelProp,
		...rest
	}: Props = $props();

	/** Stringify a value into a `data-*` attribute (undefined drops it). */
	function toAttr(value: unknown): string | undefined {
		if (value === undefined || value === null) return undefined;
		if (typeof value === 'boolean') return value ? 'true' : 'false';
		if (typeof value === 'number') return String(value);
		if (typeof value === 'string') return value;
		return JSON.stringify(value);
	}

	/* The `data-wb-*` map. Omitted props emit no attribute (so the library
	 * applies its defaults); arrays are JSON-encoded for `JSON.parse()`. */
	const dataAttrs = $derived.by<Record<string, string | undefined>>(() => ({
		[mode === 'queue' ? 'data-wb-queue' : 'data-wb-play']: '',
		'data-wb-url': toAttr(url),
		'data-wb-id': toAttr(id ?? url),
		'data-wb-title': toAttr(title),
		'data-wb-artist': toAttr(artist),
		'data-wb-album': toAttr(album),
		'data-wb-artwork': toAttr(artwork),
		'data-wb-link': toAttr(link),
		'data-wb-duration': toAttr(duration),
		'data-wb-bpm': toAttr(bpm),
		'data-wb-key': toAttr(musicalKey),
		'data-wb-meta': Array.isArray(meta) && meta.length > 0 ? JSON.stringify(meta) : undefined,
		'data-wb-waveform': Array.isArray(waveform) ? JSON.stringify(waveform) : toAttr(waveform),
		'data-wb-markers':
			Array.isArray(markers) && markers.length > 0 ? JSON.stringify(markers) : undefined,
		'data-wb-favorited': toAttr(favorited),
		'data-wb-in-cart': toAttr(inCart),
	}));

	const ariaLabel = $derived(
		ariaLabelProp ??
			(mode === 'queue'
				? title
					? `Add ${title} to queue`
					: 'Add to queue'
				: title
					? `Play ${title}`
					: 'Play')
	);

	const mergedClass = $derived(`wb-icon-swap ${className}`.trim());
</script>

<svelte:element
	this={as}
	{...rest}
	class={mergedClass}
	aria-label={ariaLabel}
	href={as === 'a' ? href : undefined}
	type={as === 'button' ? 'button' : undefined}
	{...dataAttrs}
>
	{#if children}
		{@render children()}
	{:else if !noDefaultIcons}
		<svg class="wb-show-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M8 5v14l11-7z" />
		</svg>
		<svg class="wb-show-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M6 5h4v14H6zM14 5h4v14h-4z" />
		</svg>
	{/if}
</svelte:element>
