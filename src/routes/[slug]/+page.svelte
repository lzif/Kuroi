<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  let { data }: { data: PageData } = $props();
  
  // Derived state
  let isWatchMode = $derived(data.currentEpisode !== null && data.watchData);
  let activeStreamIndex = $state(0);
  
  // Helper to construct episode URL
  function getEpisodeUrl(epNum: number) {
    return `/${$page.params.slug}?ep=${epNum}`;
  }

  // Handle stream selection
  function selectStream(index: number) {
    activeStreamIndex = index;
  }
</script>

<div class="min-h-screen bg-gray-950 text-gray-100">
  
  <!-- Detail View (Hero) -->
  {#if !isWatchMode}
    <div class="relative w-full h-[500px] overflow-hidden">
      <!-- Blurred Background -->
      <div 
        class="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110"
        style="background-image: url('{data.anime.coverImage}')"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent"></div>

      <!-- Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col md:flex-row items-end pb-12 gap-8">
        <!-- Cover Image -->
        <div class="w-48 md:w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800">
          <img src={data.anime.coverImage} alt={data.anime.title} class="w-full h-full object-cover" />
        </div>

        <!-- Text Info -->
        <div class="flex-1 space-y-4 mb-2">
          <h1 class="text-4xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
            {data.anime.title}
          </h1>
          <div class="flex flex-wrap gap-2">
            {#each data.anime.genres as genre}
              <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm backdrop-blur-sm border border-emerald-500/30">
                {genre}
              </span>
            {/each}
          </div>
          <div class="flex items-center gap-6 text-sm md:text-base text-gray-300 font-medium">
            <div class="flex items-center gap-2">
              <span class="text-emerald-400">Status:</span> {data.anime.status}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-400">Type:</span> {data.anime.type}
            </div>
            {#if data.anime.releaseYear}
            <div class="flex items-center gap-2">
              <span class="text-emerald-400">Year:</span> {data.anime.releaseYear}
            </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Details Content -->
    <div class="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- Main Column: Synopsis & Episodes -->
      <div class="lg:col-span-2 space-y-12">
        
        <section>
          <h2 class="text-xl font-bold text-white mb-4 border-l-4 border-emerald-500 pl-3">Synopsis</h2>
          <p class="text-gray-400 leading-relaxed text-lg">
            {data.anime.synopsis || 'No synopsis available.'}
          </p>
        </section>

        <section>
          <div class="flex items-center justify-between mb-6">
             <h2 class="text-xl font-bold text-white border-l-4 border-emerald-500 pl-3">Episodes</h2>
             <span class="text-gray-500 text-sm">{data.episodes.length} Episodes Available</span>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {#each data.episodes as ep}
              <a 
                href={getEpisodeUrl(ep.episodeNumber)}
                class="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/50 p-3 rounded transition-all flex flex-col items-center justify-center text-center group"
              >
                <span class="text-sm font-medium text-gray-300 group-hover:text-emerald-400">Episode {ep.episodeNumber}</span>
                {#if ep.releaseDate}
                  <span class="text-[10px] text-gray-600 mt-1">{ep.releaseDate}</span>
                {/if}
              </a>
            {/each}
          </div>
        </section>
      </div>

      <!-- Sidebar: Info -->
      <div class="space-y-8">
        {#if data.anime.alternativeTitles?.length}
          <div class="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 class="text-lg font-semibold text-white mb-4">Alternative Titles</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              {#each data.anime.alternativeTitles as title}
                <li class="border-b border-gray-800 last:border-0 pb-2 last:pb-0">{title}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  {/if}


  <!-- Watch View -->
  {#if isWatchMode && data.watchData}
    <div class="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
      
      <!-- Left: Player -->
      <div class="flex-1 space-y-6">
        <!-- Breadcrumbs / Nav -->
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <a href="/" class="hover:text-emerald-400">Home</a>
          <span>/</span>
          <a href="/{$page.params.slug}" class="hover:text-emerald-400 max-w-[200px] truncate">{data.anime.title}</a>
          <span>/</span>
          <span class="text-white">Episode {data.currentEpisode}</span>
        </div>

        <!-- Video Container -->
        <div class="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-800 relative group">
           {#if data.watchData.streamLinks.length > 0}
             <iframe 
               src={data.watchData.streamLinks[activeStreamIndex].url}
               title="Video Player"
               class="w-full h-full"
               frameborder="0"
               allowfullscreen
             ></iframe>
           {:else}
             <div class="absolute inset-0 flex items-center justify-center text-gray-500">
               No stream available
             </div>
           {/if}
        </div>

        <!-- Player Controls / Server Select -->
        <div class="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div class="flex flex-wrap items-center justify-between gap-4">
             <div>
               <h1 class="text-lg font-bold text-white mb-1">Episode {data.currentEpisode}</h1>
               <p class="text-sm text-gray-400">{data.anime.title}</p>
             </div>
             
             <!-- Server Selector -->
             <div class="flex flex-wrap gap-2">
               {#each data.watchData.streamLinks as stream, i}
                 <button 
                   onclick={() => selectStream(i)}
                   class="px-3 py-1.5 rounded text-xs font-medium transition-colors border {activeStreamIndex === i ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'}"
                 >
                   {stream.server || `Server ${i+1}`}
                 </button>
               {/each}
             </div>
          </div>
        </div>

        <!-- Download Links -->
         {#if data.watchData.downloadLinks?.length > 0}
          <div class="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 class="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Download</h3>
            <div class="flex flex-wrap gap-2">
              {#each data.watchData.downloadLinks as link}
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-xs rounded border border-gray-700 transition-colors"
                >
                  {link.quality || 'Download'}
                </a>
              {/each}
            </div>
          </div>
         {/if}
      </div>


      <!-- Right: Sidebar (Episodes) -->
      <div class="w-full lg:w-80 flex-shrink-0 flex flex-col h-[calc(100vh-100px)] lg:sticky lg:top-8">
        <div class="bg-gray-900 rounded-lg border border-gray-800 flex-1 flex flex-col overflow-hidden">
          <div class="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
            <h3 class="font-bold text-white">Episodes</h3>
            <p class="text-xs text-gray-500 mt-1">{data.episodes.length} episodes total</p>
          </div>
          
          <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
             {#each data.episodes as ep}
               <a 
                 href={getEpisodeUrl(ep.episodeNumber)}
                 class="block p-3 rounded transition-colors border {data.currentEpisode === ep.episodeNumber ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-transparent border-transparent hover:bg-gray-800 text-gray-300'}"
               >
                 <div class="flex items-center gap-3">
                   <span class="text-sm font-mono opacity-50">#{ep.episodeNumber}</span>
                   <span class="text-sm font-medium truncate">Episode {ep.episodeNumber}</span>
                 </div>
               </a>
             {/each}
          </div>
        </div>
      </div>

    </div>
  {/if}

</div>

<style>
  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #111827;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #4B5563;
  }
</style>
