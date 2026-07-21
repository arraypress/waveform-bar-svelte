/**
 * WaveformBar.test.ts
 * -------------------
 *
 * The core `@arraypress/waveform-bar` library is mocked at the module
 * boundary, and the global it installs (`window.WaveformBar`) is
 * stubbed. These tests cover the wrappers' own responsibilities:
 *
 *   - `<WaveformBar>`         — renders the persist host, calls
 *                               `init(config)` on mount, re-inits on
 *                               config-shape change (not on same-shape),
 *                               destroys on unmount.
 *   - `<WaveformBarTrigger>`  — renders the chosen element with the
 *                               correct `data-wb-*` attributes, honours
 *                               `as` / `mode` / `noDefaultIcons`, merges
 *                               fall-through class, and forwards clicks.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

/* The component imports the library only for its global side effect and
 * then talks to window.WaveformBar — so the module mock can be empty. */
vi.mock('@arraypress/waveform-bar', () => ({ default: {}, WaveformBar: {} }));

import WaveformBar from '../src/lib/WaveformBar.svelte';
import WaveformBarTrigger from '../src/lib/WaveformBarTrigger.svelte';

const init = vi.fn();
const destroy = vi.fn();

beforeEach(() => {
	init.mockClear();
	destroy.mockClear();
	(window as unknown as { WaveformBar: unknown }).WaveformBar = { init, destroy };
});

describe('WaveformBar (Svelte)', () => {
	it('renders the persist host div with id + base class', () => {
		const { container } = render(WaveformBar, { props: { hostId: 'my-bar' } });
		const host = container.querySelector('div#my-bar');
		expect(host).not.toBeNull();
		expect(host!.classList.contains('wb-host')).toBe(true);
		expect(host!.getAttribute('data-wb-persist')).toBe('true');
	});

	it('calls init(config) on mount', async () => {
		const config = { persist: true, continuous: true };
		render(WaveformBar, { props: { config } });
		await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(1));
		expect(init).toHaveBeenCalledWith(config);
	});

	it('forwards crossOrigin through to init() verbatim', async () => {
		const config = { crossOrigin: 'anonymous' as const };
		render(WaveformBar, { props: { config } });
		await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(1));
		expect(init).toHaveBeenCalledWith(config);
	});

	it('re-inits when the config shape changes', async () => {
		const { rerender } = render(WaveformBar, { props: { config: { continuous: true } } });
		await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(1));
		await rerender({ config: { continuous: false, showQueue: true } });
		await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(2));
		expect(init).toHaveBeenLastCalledWith({ continuous: false, showQueue: true });
	});

	it('does NOT re-init when a fresh config object has the same shape', async () => {
		const { rerender } = render(WaveformBar, { props: { config: { continuous: true } } });
		await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(1));
		await rerender({ config: { continuous: true } });
		await new Promise((r) => setTimeout(r, 20));
		expect(init).toHaveBeenCalledTimes(1);
	});

	it('destroys the bar on unmount', async () => {
		const { unmount } = render(WaveformBar);
		await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(1));
		unmount();
		expect(destroy).toHaveBeenCalledTimes(1);
	});
});

describe('WaveformBarTrigger (Svelte)', () => {
	it('renders a <button> by default with the data-wb-play contract', () => {
		const { container } = render(WaveformBarTrigger, {
			props: { url: '/a.mp3', title: 'Song A', artist: 'Artist' },
		});
		const btn = container.querySelector('button')!;
		expect(btn).not.toBeNull();
		expect(btn.getAttribute('type')).toBe('button');
		expect(btn.getAttribute('data-wb-play')).toBe('');
		expect(btn.getAttribute('data-wb-url')).toBe('/a.mp3');
		expect(btn.getAttribute('data-wb-id')).toBe('/a.mp3'); // falls back to url
		expect(btn.getAttribute('data-wb-title')).toBe('Song A');
		expect(btn.getAttribute('data-wb-artist')).toBe('Artist');
		expect(btn.classList.contains('wb-icon-swap')).toBe(true);
		expect(btn.getAttribute('aria-label')).toBe('Play Song A');
	});

	it('omits data-wb-* attributes for absent props', () => {
		const { container } = render(WaveformBarTrigger, { props: { url: '/a.mp3' } });
		const btn = container.querySelector('button')!;
		expect(btn.getAttribute('data-wb-artist')).toBeNull();
		expect(btn.getAttribute('data-wb-album')).toBeNull();
		expect(btn.getAttribute('data-wb-markers')).toBeNull();
	});

	it('uses data-wb-queue + queue aria-label in queue mode', () => {
		const { container } = render(WaveformBarTrigger, {
			props: { url: '/a.mp3', title: 'Song A', mode: 'queue' },
		});
		const btn = container.querySelector('button')!;
		expect(btn.getAttribute('data-wb-queue')).toBe('');
		expect(btn.getAttribute('data-wb-play')).toBeNull();
		expect(btn.getAttribute('aria-label')).toBe('Add Song A to queue');
	});

	it('JSON-encodes meta / markers arrays', () => {
		const markers = [{ time: 0, label: 'Intro' }];
		const { container } = render(WaveformBarTrigger, {
			props: { url: '/a.mp3', meta: ['320kbps', 'WAV'], markers },
		});
		const btn = container.querySelector('button')!;
		expect(btn.getAttribute('data-wb-meta')).toBe(JSON.stringify(['320kbps', 'WAV']));
		expect(btn.getAttribute('data-wb-markers')).toBe(JSON.stringify(markers));
	});

	it('renders as an anchor with href when as="a"', () => {
		const { container } = render(WaveformBarTrigger, {
			props: { as: 'a', href: '/track/1', url: '/a.mp3' },
		});
		const a = container.querySelector('a')!;
		expect(a).not.toBeNull();
		expect(a.getAttribute('href')).toBe('/track/1');
		expect(a.getAttribute('data-wb-play')).toBe('');
		expect(a.hasAttribute('type')).toBe(false);
	});

	it('renders default play/pause icons, suppressed by noDefaultIcons', () => {
		const withIcons = render(WaveformBarTrigger, { props: { url: '/a.mp3' } });
		expect(withIcons.container.querySelector('svg.wb-show-play')).not.toBeNull();
		expect(withIcons.container.querySelector('svg.wb-show-pause')).not.toBeNull();

		const noIcons = render(WaveformBarTrigger, { props: { url: '/a.mp3', noDefaultIcons: true } });
		expect(noIcons.container.querySelector('svg')).toBeNull();
	});

	it('merges fall-through class + forwards a click listener', async () => {
		const onclick = vi.fn();
		const { container } = render(WaveformBarTrigger, {
			props: { url: '/a.mp3', class: 'card-btn', onclick },
		});
		const btn = container.querySelector('button')!;
		expect(btn.classList.contains('wb-icon-swap')).toBe(true);
		expect(btn.classList.contains('card-btn')).toBe(true);
		await fireEvent.click(btn);
		expect(onclick).toHaveBeenCalledTimes(1);
	});
});
