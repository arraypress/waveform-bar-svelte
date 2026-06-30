/**
 * vitest.config.ts
 * ----------------
 *
 * Vitest configuration for the Svelte bar wrapper. The Svelte Vite
 * plugin compiles the `.svelte` components under test; `jsdom`
 * provides the DOM. The actual `@arraypress/waveform-bar` library is
 * mocked at the module boundary (it relies on browser-only APIs), so
 * the tests verify the wrappers' own responsibilities.
 */
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		include: ['test/**/*.test.ts'],
		environment: 'jsdom',
		globals: false,
		setupFiles: ['./test/setup.ts'],
	},
	resolve: {
		conditions: ['browser'],
	},
});
