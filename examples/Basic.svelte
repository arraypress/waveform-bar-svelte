<!--
  examples/Basic.svelte
  ---------------------

  Reference Svelte 5 component demonstrating <WaveformBar> +
  <WaveformBarTrigger>. Copy/paste into your own Svelte / SvelteKit app.

  Library setup (do this ONCE in your app entry — e.g. `+layout.svelte`).
  ORDER MATTERS — the player installs window.WaveformPlayer, which the bar needs:

    import '@arraypress/waveform-player/dist/waveform-player.css';
    import '@arraypress/waveform-bar/dist/waveform-bar.css';
    import '@arraypress/waveform-player';   // sets window.WaveformPlayer
    import '@arraypress/waveform-bar';      // sets window.WaveformBar
-->
<script lang="ts">
	import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-svelte';

	const tracks = [
		{ url: '/audio/track-1.mp3', title: 'Midnight Dreams', artist: 'The Wavelength', artwork: '/img/1.jpg' },
		{ url: '/audio/track-2.mp3', title: 'Solar Flare', artist: 'Aurora', artwork: '/img/2.jpg' },
	];
</script>

<!-- A grid of cards, each with a play trigger -->
<div class="grid">
	{#each tracks as t (t.url)}
		<article class="card">
			<img src={t.artwork} alt={`${t.title} cover`} />
			<h3>{t.title}</h3>
			<p>{t.artist}</p>
			<WaveformBarTrigger url={t.url} title={t.title} artist={t.artist} artwork={t.artwork} class="play-btn" />
			<WaveformBarTrigger mode="queue" url={t.url} title={t.title}>+ Queue</WaveformBarTrigger>
		</article>
	{/each}
</div>

<!-- The persistent bar — render ONCE, typically in your root layout -->
<WaveformBar config={{ persist: true, continuous: true, showQueue: true }} />
