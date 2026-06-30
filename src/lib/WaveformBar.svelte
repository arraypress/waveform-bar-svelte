<!--
  WaveformBar.svelte
  ------------------

  Singleton mount component for `@arraypress/waveform-bar`.

  Render this ONCE in your root layout / app entry. It renders a persist
  host `<div>` and runs `window.WaveformBar.init(config)` inside a
  browser-only `$effect` — the core library scans the page for
  `[data-wb-play]` / `[data-wb-queue]` triggers (rendered by
  `<WaveformBarTrigger>`) and binds click handlers automatically.

  ## Setup

  Load both core libraries' JS + CSS in your app entry. ORDER MATTERS —
  the player installs `window.WaveformPlayer`, which the bar needs:

      import '@arraypress/waveform-player/dist/waveform-player.css';
      import '@arraypress/waveform-bar/dist/waveform-bar.css';
      import '@arraypress/waveform-player';   // sets window.WaveformPlayer
      import '@arraypress/waveform-bar';      // sets window.WaveformBar

  ## What the component does

  - Renders a `<div id={hostId}>` for the persist host.
  - On mount, dynamically `import()`s the core library (SSR-safe) and
    calls `window.WaveformBar.init(config)`.
  - When the config's structural shape (or `persist`) changes, calls
    `init()` again — the library destroys + recreates internally.
  - On unmount, calls `window.WaveformBar.destroy()` so the bar doesn't
    leak listeners across remounts / route changes.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WaveformBarConfig } from './types.js';

	type Props = {
		/** Bar configuration. Pass any subset of `WaveformBarConfig`. */
		config?: WaveformBarConfig;
		/** Relocate the bar into the persist host so it survives routing. */
		persist?: boolean;
		/** DOM `id` for the persist host. */
		hostId?: string;
	} & HTMLAttributes<HTMLDivElement>;

	let {
		config,
		persist = true,
		hostId = 'waveform-bar-host',
		class: className = '',
		...rest
	}: Props = $props();

	/** Minimal structural view of the global the wrapper drives. */
	type BarGlobal = { init: (config?: unknown) => void; destroy?: () => void };

	function getBarGlobal(): BarGlobal | null {
		return (
			(typeof window !== 'undefined' &&
				(window as unknown as { WaveformBar?: BarGlobal }).WaveformBar) ||
			null
		);
	}

	/**
	 * Stable string key from the config so a fresh object with the same
	 * shape doesn't churn the bar. Functions (e.g. `actions.endpoint`)
	 * collapse to a sentinel — pass stable references for those.
	 */
	function configKey(c?: WaveformBarConfig): string {
		if (!c) return '';
		try {
			return JSON.stringify(c, (_key, value) => (typeof value === 'function' ? '<<fn>>' : value));
		} catch {
			return '';
		}
	}

	let host: HTMLDivElement;
	/* Monotonic token: every (re)init bumps it; an in-flight import whose
	 * token is stale bails instead of acting on a torn-down component. */
	let initToken = 0;

	/** Derived re-init key — the effect re-runs only when this value changes. */
	const key = $derived(`${configKey(config)}::${persist}`);

	function relocate() {
		if (!persist) return;
		const bar = document.querySelector('.waveform-bar');
		if (host && bar && bar.parentElement !== host) host.appendChild(bar);
	}

	function doInit() {
		const my = ++initToken;
		void import('@arraypress/waveform-bar')
			.then(() => {
				if (my !== initToken) return; // superseded
				const bar = getBarGlobal();
				if (!bar) {
					console.warn(
						'[WaveformBarSvelte] window.WaveformBar is undefined after import. ' +
							'Make sure @arraypress/waveform-player is loaded BEFORE @arraypress/waveform-bar.'
					);
					return;
				}
				try {
					bar.init(config);
				} catch (err) {
					console.error('[WaveformBarSvelte] init() failed:', err);
					return;
				}
				relocate();
			})
			.catch((err) => {
				console.error('[WaveformBarSvelte] Failed to load core library:', err);
			});
	}

	function destroy() {
		const bar = getBarGlobal();
		try {
			bar?.destroy?.();
		} catch (err) {
			console.warn('[WaveformBarSvelte] destroy() threw during cleanup:', err);
		}
	}

	/* Init / re-init. Reads the derived `key` so it re-runs only when the
	 * config shape (or `persist`) changes — not on every same-shape
	 * re-render. Browser-only: SSR renders just the host `<div>`. */
	$effect(() => {
		key;
		doInit();
		return () => {
			initToken += 1;
			destroy();
		};
	});
</script>

<div
	bind:this={host}
	id={hostId}
	class={`wb-host ${className}`.trim()}
	data-wb-persist={persist ? 'true' : undefined}
	{...rest}
></div>
