<script lang="ts">
	import SectorRevenueSection from '$lib/components/SectorRevenueSection.svelte';
	import RevenueGrowthTable from '$lib/components/RevenueGrowthTable.svelte';

	function playVideo(videoId: string, overlayId: string) {
		const video = document.getElementById(videoId) as HTMLIFrameElement;
		const overlay = document.getElementById(overlayId);
		if (video && overlay) {
			if (video.src.includes('autoplay=1')) return;
			video.src += '&autoplay=1';
			overlay.style.display = 'none';
		}
	}
</script>

<svelte:head>
	<title>ClearSky Business Platform</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-white text-[#0F172B]">
	<!-- DESKTOP VIEW -->
	<div class="hidden md:block">
		<div class="mx-auto max-w-[1400px] px-8 py-12">
			<div class="mb-16 flex flex-col items-center text-center py-4">
				<h1 class="text-4xl font-black tracking-tight text-[#65A0EC] lg:text-5xl">
					ClearSky Business Platform
				</h1>
				<p class="mt-4 text-lg font-bold text-[#0F172B]">
					Grow Revenue by 72-118% using ClearSky's Playbook
				</p>
			</div>

			<div class="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2 justify-center items-center">
				<div class="relative w-full">
					<iframe
						id="desktop-video"
						width="420"
						height="300"
						src="https://www.youtube.com/embed/EDQ3xZKlMC8?controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1"
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
						class="h-[394px] w-[700px]"
					></iframe>
				</div>

				<div class="relative flex justify-center lg:justify-end">
					<div class="relative h-[450px] w-full max-w-[550px]">
						<img
							src="/home-img.png"
							alt="ClearSky Platform Illustration"
							class="h-full w-full object-contain"
						/>
					</div>
				</div>
			</div>

			<SectorRevenueSection />
		</div>

		<img src="/modules-banner.png" class="w-full" alt="ClearSky's 8 Modules that Drive Revenue Growth" />

		<RevenueGrowthTable />

		<div class="w-full ">
			<h3 class="mb-12 text-center font-bold text-[48px] leading-[68px] text-[#090F31]">
				OPERATIONS ENGINE
			</h3>
			<div class="mx-auto max-w-[1400px] px-8">
				<div class="mb-20">
					<div
						class="flex flex-nowrap justify-center gap-6 rounded-2xl p-6"
					>
						<div
							class="flex flex-col bg-white p-6 flex-1 min-w-0 min-h-[243px] rounded-[30px] shadow-[0px_16px_32px_-8px_rgba(12,12,13,0.4)]"
						>
							<h4 class="mb-4 font-bold text-[16px] leading-[22px] text-[#090F31]">
								Website + Conversion Optimization
							</h4>
							<p class="text-[15px] leading-[21px] font-medium text-[#090F31]">
								A Professionally rebuilt website engineered for speed, clarity, and conversion
								performance. includes modern UX, structured layouts, and CRO best practices.
								Significantly increases visitor-to-lead conversion rates.
							</p>
						</div>

						<div
							class="flex flex-col bg-white p-6 flex-1 min-w-0 min-h-[243px] rounded-[30px] shadow-[0px_16px_32px_-8px_rgba(12,12,13,0.4)]"
						>
							<h4 class="mb-4 font-bold text-[16px] leading-[22px] text-[#090F31]">
								SEO + GMB + Schema, AEO + Social
							</h4>
							<p class="text-[15px] leading-[21px] font-medium text-[#090F31]">
								Improves search visibility and local ranking through technical SEO, schema structure,
								optimized Google Business Profiles, and continues FAQ Publishing. increases relevance,
								trust and intent-driven traffic
							</p>
						</div>

						<div
							class="flex flex-col bg-white p-6 flex-1 min-w-0 min-h-[243px] rounded-[30px] shadow-[0px_16px_32px_-8px_rgba(12,12,13,0.4)]"
						>
							<h4 class="mb-4 font-bold text-[16px] leading-[22px] text-[#090F31]">
								Parsing Engine
							</h4>
							<p class="text-[15px] leading-[21px] font-medium text-[#090F31]">
								Automatically generates fresh, relevant, sector-specific content sourced from approved
								industry materials. Strengthens EEAT signals, improves long-term SEO and AI Search
								placement, and keeps the site continuously updated.
							</p>
						</div>
					</div>
				</div>

				<div>
					<h3 class="mb-12 text-center font-bold text-[48px] leading-[68px] text-[#090F31]">
						COMMUNICATION ENGINE
					</h3>
					<div class="flex flex-nowrap justify-center gap-6 rounded-2xl p-6">
						<div
							class="flex flex-col bg-white p-6 flex-1 min-w-0 min-h-[351px] rounded-[30px] shadow-[0px_16px_32px_-8px_rgba(12,12,13,0.4)]"
						>
							<h4 class="mb-4 font-bold text-[16px] leading-[22px] text-[#090F31]">
								Instant Response
							</h4>
							<p class="text-[15px] leading-[21px] font-medium text-[#090F31]">
								AI responds to every inquiry across SMS, email, Web forms, Social Channels, and Missed
								Calls in under five seconds. This removes the biggest point of revenue loss: slow response
								time. Faster replies dramatically increase conversions and eliminate customer frustration.
							</p>
						</div>

						<div
							class="flex flex-col bg-white p-6 flex-1 min-w-0 min-h-[351px] rounded-[30px] shadow-[0px_16px_32px_-8px_rgba(12,12,13,0.4)]"
						>
							<h4 class="mb-4 text-center font-bold text-[16px] leading-[22px] text-[#090F31]">
								AI Follow-up & Automation
							</h4>
							<p class="text-[15px] leading-[21px] font-medium text-[#090F31]">
								AI responds to every inquiry across SMS, email, Web forms, Social Channels, and Missed
								Calls in under five seconds. This removes the biggest point of revenue loss: slow response
								time. Faster replies dramatically increase conversions and eliminate customer frustration.
							</p>
						</div>

						<div
							class="flex flex-col bg-white p-6 flex-1 min-w-0 min-h-[351px] rounded-[30px] shadow-[0px_16px_32px_-8px_rgba(12,12,13,0.4)]"
						>
							<h4 class="mb-4 text-center font-bold text-[16px] leading-[22px] text-[#090F31]">
								Communications HUB
							</h4>
							<p class="text-[15px] leading-[21px] font-medium text-[#090F31]">
								Unifies SMS, Email, Phone transcripts, chat, and Social messages into one organized
								inbox. AI analyzes Intent, Sentiment, and Urgency, preparing accurate reply drafts for
								human approval. Eliminates scattered communication and dropped opportunities.
							</p>
						</div>

						<div
							class="flex flex-col bg-white p-6 flex-1 min-w-0 min-h-[351px] rounded-[30px] shadow-[0px_16px_32px_-8px_rgba(12,12,13,0.4)]"
						>
							<h4 class="mb-4 text-center font-bold text-[16px] leading-[22px] text-[#090F31]">
								Conversational AI
							</h4>
							<p class="text-[15px] leading-[21px] font-medium text-[#090F31]">
								Understands customer questions, interprets context, and drafts high-quality responses
								based on two knowledge bases: secter-wide and business-specific. Ensures accuracy,
								consistency while reducing manual typing for teams
							</p>
						</div>

						<div
							class="flex flex-col bg-white p-6 flex-1 min-w-0 min-h-[351px] rounded-[30px] shadow-[0px_16px_32px_-8px_rgba(12,12,13,0.4)]"
						>
							<h4 class="mb-4 text-center font-bold text-[16px] leading-[22px] text-[#090F31]">
								ViewRoom
							</h4>
							<p class="text-[15px] leading-[21px] font-medium text-[#090F31]">
								A Virtual Meeting environment for guided walkthroughs, visual explanations, and proposal
								reviews. Enhances understanding, reduces uncertainty, and speed op decision-making. High
								Impact for trades, Manufacturing and Tourism.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<footer class="relative px-4 py-8 text-center text-[#090F31]">
			<p class="mb-4 text-2xl font-bold leading-relaxed">
				If you have any questions, please reach out to +1 705-274-9564 or email:
				r.dredhart@clearskysoftware.net
			</p>
		</footer>
	</div>

	<!-- MOBILE VIEW -->
	<div class="md:hidden">
		<div class="mx-auto w-full">
			<div class="relative w-full px-4 py-2">
				<div class="relative w-full">
					<iframe
						id="mobile-video"
						width="100%"
						height="200"
						src="https://www.youtube.com/embed/EDQ3xZKlMC8?controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1"
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
						class="h-[200px] w-full"
					></iframe>
				</div>
			</div>

			<div class="bg-[#0F172B] px-4 py-4 text-center">
				<h2 class="text-xl font-bold text-white">AI helps lift Revenue Growth</h2>
				<p class="text-lg font-medium text-white/90">by 72-118%</p>
			</div>

			<div class="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2">
				<div class="relative flex justify-center">
					<div class="relative h-[250px] w-full max-w-[600px]">
						<img
							src="/home-img.png"
							alt="ClearSky Platform Illustration"
							class="h-full w-full object-contain"
						/>
					</div>
				</div>
			</div>

			<div class="mx-auto my-4 h-px w-[90%] bg-[#D0D0D0] shadow-sm"></div>

			<SectorRevenueSection />

			<div class="bg-[#7F8FB0] px-4 py-8 text-center text-white">
				<p class="mx-auto max-w-3xl text-lg font-bold leading-relaxed">
					Let's be honest 72–118% growth isn't humanly possible, most of growth results comes from
					using AI. Instant replies, perfect follow-up, no missed messages. The rest comes from
					better website, SEO, and visibility. See breakdown below.
				</p>
			</div>

			<section class="bg-white py-12">
				<h4 class="mb-8 text-center text-xl font-bold">How we Drive Growth 72 – 118%</h4>
				<RevenueGrowthTable />
			</section>

			<footer class="relative px-4 py-8 text-center text-[#090F31]">
				<p class="mb-4 text-[10px] font-bold leading-relaxed">
					If you have any questions, please reach out to +1 705-274-9564 or email:
					r.dredhart@clearskysoftware.net
				</p>
			</footer>
		</div>
	</div>
</div>

<style>
	:global(html) {
		background-color: white;
	}
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-x: hidden;
		font-family: 'Source Sans 3', sans-serif;
	}
</style>
