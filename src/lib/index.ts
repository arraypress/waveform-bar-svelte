/**
 * @module @arraypress/waveform-bar-svelte
 * @description
 * Public entry point for the Svelte 5 wrapper around
 * `@arraypress/waveform-bar`.
 *
 * Two components are exported:
 *
 *   - `WaveformBar`         — singleton mount, render once in your root
 *                             layout
 *   - `WaveformBarTrigger`  — polymorphic play / queue trigger, render
 *                             anywhere you want a clickable "play this
 *                             track" element
 *
 * ```svelte
 * <script lang="ts">
 *   import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-svelte';
 * </script>
 * ```
 */
export { default as WaveformBar } from './WaveformBar.svelte';
export { default as WaveformBarTrigger } from './WaveformBarTrigger.svelte';

export type {
	WaveformBarProps,
	WaveformBarConfig,
	WaveformBarTriggerProps,
	WaveformBarTrackData,
	WaveformBarMarker,
	WaveformBarActions,
	WaveformBarAction,
	WaveformBarTheme,
	RepeatMode,
	TriggerMode,
	WaveformStyle,
} from './types.js';
