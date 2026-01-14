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

<div class="min-h-screen bg-background-light dark:bg-background-dark font-display relative overflow-x-hidden selection:bg-pop-pink selection:text-white">
  <!-- Background Pattern -->
  <div class="fixed inset-0 z-0 opacity-20 bg-dots pointer-events-none"></div>

  {#if isWatchMode && data.watchData}
    <!-- Watch View -->
    <div class="relative z-10 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 pb-20">
        <!-- Left: Player -->
        <div class="flex-1 space-y-6">
            <!-- Breadcrumbs / Nav -->
            <div class="flex items-center gap-2 text-sm font-bold text-white/90 mb-2">
                <a class="hover:underline opacity-80" href="/">DATABASE</a>
                <span>/</span>
                <a class="hover:underline opacity-80" href="/{$page.params.slug}">{data.anime.title}</a>
                <span>/</span>
                <span class="text-white drop-shadow-sm">EPISODE {data.currentEpisode}</span>
            </div>

            <!-- Video Container -->
            <div class="w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-hard-xl border-4 border-white relative group">
                <!-- Tape Decoration -->
                <div class="tape-strip absolute -top-4 -left-4 w-32 h-10 rotate-[-35deg] z-20 pointer-events-none"></div>
                
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
            <div class="bg-pop-paper dark:bg-slate-900 rounded-2xl p-6 shadow-hard-md border border-white dark:border-slate-700 relative">
                 <div class="absolute inset-0 z-0 bg-notebook opacity-40 dark:opacity-10 pointer-events-none rounded-2xl"></div>
                 <div class="relative z-10 flex flex-col gap-4">
                     <div class="flex justify-between items-start">
                         <div>
                             <h1 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Episode {data.currentEpisode}</h1>
                             <p class="text-sm font-bold text-slate-500">{data.anime.title}</p>
                         </div>
                     </div>
                     
                     <div class="flex flex-wrap gap-2">
                         {#each data.watchData.streamLinks as stream, i}
                             <button 
                                 onclick={() => selectStream(i)}
                                 class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 {activeStreamIndex === i ? 'bg-pop-deep text-white border-pop-deep shadow-hard-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-pop-deep hover:text-pop-deep'}"
                             >
                                 {stream.server || `Server ${i+1}`}
                             </button>
                         {/each}
                     </div>

                     {#if data.watchData.downloadLinks?.length > 0}
                        <div class="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 class="text-xs font-bold text-slate-400 uppercase mb-2">Download</h3>
                            <div class="flex flex-wrap gap-2">
                                {#each data.watchData.downloadLinks as link}
                                    <a 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-pop-deep text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <span class="material-symbols-outlined text-sm">download</span>
                                        {link.quality || 'Download'}
                                    </a>
                                {/each}
                            </div>
                        </div>
                     {/if}
                 </div>
            </div>
        </div>

        <!-- Right: Sidebar (Episodes) -->
        <div class="w-full lg:w-[360px] flex-shrink-0 flex flex-col h-auto lg:h-[calc(100vh-100px)] lg:sticky lg:top-8">
            <div class="bg-pop-paper dark:bg-slate-900 rounded-[2rem] shadow-hard-lg border border-white dark:border-slate-700 p-6 flex-1 flex flex-col overflow-hidden relative">
                <div class="absolute inset-0 z-0 bg-notebook opacity-40 dark:opacity-10 pointer-events-none rounded-[2rem]"></div>
                
                <div class="relative z-10 mb-4 flex items-center justify-between">
                    <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <span class="material-symbols-outlined text-pop-deep">assignment</span>
                        Mission Log
                    </h3>
                </div>
                
                <div class="relative z-10 flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                     {#each data.episodes as ep}
                       <a 
                         href={getEpisodeUrl(ep.episodeNumber)}
                         class="group flex items-center gap-3 p-3 rounded-xl border-2 transition-all {data.currentEpisode === ep.episodeNumber ? 'bg-white border-pop-deep shadow-hard-sm' : 'bg-white/50 border-transparent hover:bg-white hover:border-slate-200'}"
                       >
                         <div class="size-8 rounded-full flex items-center justify-center font-bold text-xs {data.currentEpisode === ep.episodeNumber ? 'bg-pop-deep text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-pop-sky group-hover:text-white transition-colors'}">
                             {ep.episodeNumber}
                         </div>
                         <div class="flex-1 min-w-0">
                             <p class="text-xs font-bold {data.currentEpisode === ep.episodeNumber ? 'text-pop-deep' : 'text-slate-400 group-hover:text-pop-sky'}">EPISODE {ep.episodeNumber}</p>
                             <h4 class="font-bold text-slate-800 dark:text-slate-900 text-sm truncate">{ep.title || `Episode ${ep.episodeNumber}`}</h4>
                         </div>
                         {#if data.currentEpisode === ep.episodeNumber}
                            <span class="material-symbols-outlined text-pop-deep animate-pulse">play_circle</span>
                         {/if}
                       </a>
                     {/each}
                </div>
            </div>
        </div>
    </div>
  {:else}
    <!-- Detail View -->
    
    <!-- Navigation -->
    <header class="relative z-20 w-full px-4 sm:px-8 py-4">
        <nav class="mx-auto max-w-7xl bg-white/90 dark:bg-[#1f2937]/90 backdrop-blur-md rounded-2xl shadow-hard-md border-2 border-white dark:border-gray-700 px-6 py-3 flex items-center justify-between">
            <div class="flex items-center gap-6">
                <!-- Logo -->
                <a class="flex items-center gap-2 group" href="/">
                    <div class="size-10 bg-pop-deep rounded-lg flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-300 shadow-hard-sm">
                        <span class="material-symbols-outlined text-2xl font-bold">folder_open</span>
                    </div>
                    <span class="text-pop-deep dark:text-sky-400 font-bold text-xl tracking-tight">ARCHIVE.NET</span>
                </a>
                <!-- Desktop Links -->
                <div class="hidden md:flex items-center gap-6 ml-4">
                    <a class="text-slate-600 dark:text-slate-300 font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider" href="#">Reports</a>
                    <a class="text-slate-600 dark:text-slate-300 font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider" href="#">Seasonal</a>
                    <a class="text-slate-600 dark:text-slate-300 font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider" href="#">Community</a>
                </div>
            </div>
            <!-- Search & Profile -->
            <div class="flex items-center gap-4">
                <div class="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 ring-pop-deep ring-offset-2 transition-shadow">
                    <span class="material-symbols-outlined text-slate-400">search</span>
                    <input class="bg-transparent border-none focus:ring-0 text-sm w-32 md:w-48 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium" placeholder="Search archives..." type="text"/>
                </div>
                <button class="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-md hover:scale-105 transition-transform" data-alt="User profile avatar" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUT5Pw3Mp7woCtzzILEKkC1HVwe9cXGfNfT_XyOD30CK6vtm0PqmKXETfXxg8WlP1kSF1gnoXEZqrrrnCnZjswTf8NObDZRSYyYd_SCPMnhp4-EnbzVlrn2IudbHEDU52rZC6sTOCwVzhgs-Irzw-gc8Fpkuqhlg6Q1LgqTeY0bBJDQjcDT04piiSnbK73VgLzNjvt-hqkaDNhbDuLniruFvo_xnTKcq-_Nrsh_cF3kxPUh8qIHsuaFixgsldOYnkbNyfej6OD3VtP');">
                </button>
            </div>
        </nav>
    </header>

    <!-- Breadcrumbs -->
    <div class="relative z-10 max-w-7xl mx-auto px-8 py-4 flex gap-2 text-sm font-bold text-white/90">
        <a class="hover:underline opacity-80" href="/">DATABASE</a>
        <span>/</span>
        <a class="hover:underline opacity-80" href="#">ARCHIVES</a>
        <span>/</span>
        <span class="text-white drop-shadow-sm uppercase">{data.anime.title}</span>
    </div>

    <!-- Main Content "The File" -->
    <main class="relative z-10 w-full max-w-[1000px] mx-auto px-4 pb-20">
        <!-- The File Folder Sheet -->
        <div class="relative bg-pop-paper dark:bg-slate-900 rounded-[2rem] shadow-hard-xl min-h-[800px] p-8 md:p-12 transform rotate-0 sm:rotate-[0.5deg]">
            <!-- Notebook Lines Pattern Overlay -->
            <div class="absolute inset-0 z-0 bg-notebook opacity-40 dark:opacity-10 pointer-events-none my-12 mx-8 rounded-[2rem]"></div>
            <!-- Decorative Tape - Top Left -->
            <div class="tape-strip absolute -top-4 -left-4 w-32 h-10 rotate-[-35deg] z-20 pointer-events-none"></div>
            <!-- Decorative Tape - Bottom Right -->
            <div class="tape-strip absolute -bottom-4 -right-4 w-32 h-10 rotate-[-35deg] z-20 pointer-events-none"></div>
            <!-- "CONFIDENTIAL" Stamp -->
            <div class="absolute top-8 right-8 border-4 border-red-500/20 text-red-500/20 font-black text-4xl px-4 py-2 rotate-12 pointer-events-none select-none z-0 hidden sm:block">
                CONFIDENTIAL
            </div>
            
            <!-- Content Container -->
            <div class="relative z-10 flex flex-col lg:flex-row gap-10">
                <!-- Left Column: Poster -->
                <div class="flex-shrink-0 w-full lg:w-[320px] flex flex-col items-center lg:items-start">
                    <div class="relative group cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:rotate-0 rotate-[-2deg]">
                        <!-- Poster Tape -->
                        <div class="tape-strip absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 rotate-0 z-20"></div>
                        <!-- Poster Image -->
                        <div class="relative rounded-lg overflow-hidden border-4 border-white shadow-hard-md group-hover:shadow-hard-xl transition-shadow duration-300 bg-gray-200 aspect-[2/3] w-[280px]">
                            <img 
                                src={data.anime.coverImage} 
                                alt={data.anime.title} 
                                class="w-full h-full object-cover"
                            />
                            <!-- Overlay Play Button -->
                            <a href={data.episodes.length > 0 ? getEpisodeUrl(data.episodes[0].episodeNumber) : '#'} class="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                                <div class="size-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                                    <span class="material-symbols-outlined text-pop-deep text-4xl">play_arrow</span>
                                </div>
                            </a>
                        </div>
                        <!-- Rating Badge -->
                        {#if data.anime.score}
                        <div class="absolute -bottom-4 -right-4 bg-pop-hot text-white font-bold text-xl px-4 py-2 rounded-full border-4 border-white shadow-sm rotate-[10deg] flex items-center gap-1">
                            <span class="material-symbols-outlined text-lg">star</span>
                            {data.anime.score}
                        </div>
                        {/if}
                    </div>
                    <!-- Action Buttons -->
                    <div class="mt-8 w-full max-w-[280px] space-y-3">
                        {#if data.episodes.length > 0}
                        <a href={getEpisodeUrl(data.episodes[0].episodeNumber)} class="w-full bg-pop-hot hover:bg-pink-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-hard-sm hover:shadow-hard-md hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 group">
                            <span class="material-symbols-outlined group-hover:animate-pulse">play_circle</span>
                            START WATCHING
                        </a>
                        {/if}
                        <div class="flex gap-3">
                            <button class="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl border-2 border-slate-200 hover:border-pop-deep transition-colors flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">add</span>
                                List
                            </button>
                            <button class="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl border-2 border-slate-200 hover:border-pop-deep transition-colors flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">share</span>
                                Share
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Info & Details -->
                <div class="flex-1 pt-2 lg:pt-4">
                    <!-- Header -->
                    <div class="mb-6">
                        <div class="flex flex-wrap gap-2 mb-3">
                            <span class="px-3 py-1 bg-sky-100 text-pop-deep text-xs font-bold rounded-md uppercase tracking-wide border border-sky-200">{data.anime.type || 'TV Series'}</span>
                            <span class="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-bold rounded-md uppercase tracking-wide border border-purple-200">{data.anime.status === 'completed' ? 'Finished' : (data.anime.status || 'Unknown')}</span>
                        </div>
                        <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4 drop-shadow-sm font-display uppercase">
                            {data.anime.title}
                        </h1>
                        <!-- Chips -->
                        <div class="flex flex-wrap gap-2 mb-6">
                            {#each data.anime.genres as genre}
                                <span class="px-4 py-1.5 bg-white border-2 border-slate-200 rounded-full text-slate-600 text-sm font-bold hover:border-pop-deep hover:text-pop-deep transition-colors">
                                    {genre}
                                </span>
                            {/each}
                        </div>
                    </div>
                    <!-- Tab-like Section dividers -->
                    <div class="w-full h-1 bg-slate-200 rounded-full mb-6 relative overflow-hidden">
                        <div class="absolute left-0 top-0 h-full w-1/3 bg-pop-deep"></div>
                    </div>
                    <!-- Info Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 font-body">
                        <div class="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Source</p>
                            <p class="text-slate-800 dark:text-slate-200 font-bold truncate">{data.anime.source}</p>
                        </div>
                        <div class="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Year</p>
                            <p class="text-slate-800 dark:text-slate-200 font-bold">{data.anime.releaseYear || 'N/A'}</p>
                        </div>
                        <div class="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Episodes</p>
                            <p class="text-slate-800 dark:text-slate-200 font-bold">{data.anime.totalEpisodes || data.episodes.length} Eps</p>
                        </div>
                        <div class="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p class="text-xs text-slate-400 font-bold uppercase mb-1">Score</p>
                            <p class="text-slate-800 dark:text-slate-200 font-bold">{data.anime.score || '-'}</p>
                        </div>
                    </div>
                    <!-- Synopsis -->
                    <div class="prose prose-slate dark:prose-invert mb-10 max-w-none">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2 mb-2">
                            <span class="w-2 h-2 bg-pop-hot rounded-full"></span>
                            Briefing
                        </h3>
                        <p class="text-slate-600 dark:text-slate-300 leading-relaxed font-body bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            {data.anime.synopsis || 'No synopsis available.'}
                        </p>
                    </div>
                    <!-- Mission Log (Episodes) -->
                    <div class="relative">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <span class="material-symbols-outlined text-pop-deep">assignment</span>
                                Mission Log
                            </h3>
                            <div class="flex gap-2">
                                <button class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-pop-deep transition-colors"><span class="material-symbols-outlined">grid_view</span></button>
                                <button class="p-2 bg-slate-100 rounded-lg text-pop-deep"><span class="material-symbols-outlined">view_list</span></button>
                            </div>
                        </div>
                        <!-- Timeline Container -->
                        <div class="relative pl-4 space-y-4">
                            <!-- Vertical Line -->
                            <div class="absolute left-[27px] top-4 bottom-4 w-0.5 mission-line z-0"></div>
                            
                            {#each data.episodes as ep, i}
                                <div class="relative z-10 flex items-center gap-4 group">
                                    <!-- Marker -->
                                    <div class="size-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 z-10 {i === 0 ? 'bg-pop-hot' : 'bg-white border-slate-300'}">
                                         {#if i === 0}
                                            <span class="material-symbols-outlined text-white text-sm font-bold">play_arrow</span>
                                         {:else}
                                            <span class="text-[10px] font-bold text-slate-400">{ep.episodeNumber}</span>
                                         {/if}
                                    </div>
                                    
                                    <!-- Card -->
                                    <a href={getEpisodeUrl(ep.episodeNumber)} class="flex-1 border rounded-lg p-3 shadow-sm flex justify-between items-center cursor-pointer transition-all {i === 0 ? 'bg-white ring-2 ring-pop-deep ring-offset-2 border-slate-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}">
                                        <div class="flex justify-between items-center w-full">
                                            <div>
                                                <p class="text-xs font-bold {i === 0 ? 'text-pop-deep' : 'text-slate-400'} mb-0.5">EPISODE {ep.episodeNumber}</p>
                                                <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{ep.title || `Episode ${ep.episodeNumber}`}</h4>
                                            </div>
                                            {#if i === 0}
                                             <div class="bg-slate-100 dark:bg-slate-700 rounded-lg p-1.5">
                                                <span class="material-symbols-outlined text-pop-deep">play_arrow</span>
                                             </div>
                                            {:else}
                                             <span class="material-symbols-outlined text-slate-300">play_circle</span>
                                            {/if}
                                        </div>
                                    </a>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer / Bottom Branding -->
        <div class="text-center mt-12 mb-8">
            <p class="text-white/60 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <span class="w-1 h-1 bg-white rounded-full"></span>
                Archive.net secure connection
                <span class="w-1 h-1 bg-white rounded-full"></span>
            </p>
        </div>
    </main>
  {/if}
</div>

<style>
    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent; 
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1; 
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: content-box;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #94a3b8; 
    }
    
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #475569;
    }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #64748b; 
    }
</style>
