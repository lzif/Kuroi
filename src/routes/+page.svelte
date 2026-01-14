<script lang="ts">
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();

  // Helper to get hero anime (first ongoing or first completed)
  let heroAnime = $derived(data.ongoing.length > 0 ? data.ongoing[0] : (data.completed.length > 0 ? data.completed[0] : null));
</script>

<!-- Top Navigation -->
<header class="sticky top-0 z-50 w-full px-4 pt-4 pb-2">
    <div class="mx-auto max-w-7xl">
        <div class="flex items-center justify-between rounded-2xl border-4 border-white bg-pop-paper px-6 py-3 shadow-hard-md">
            <!-- Logo Area -->
            <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-hard-sm rotate-3 border-2 border-white">
                    <span class="material-symbols-outlined">play_shapes</span>
                </div>
                <h1 class="font-display text-xl font-bold tracking-tight text-slate-800 hidden sm:block">
                    KIVOTOS<span class="text-primary">STREAM</span>
                </h1>
            </div>
            <!-- Nav Links (Desktop) -->
            <nav class="hidden md:flex items-center gap-2">
                <a class="group relative flex items-center gap-2 rounded-xl px-4 py-2 font-display font-bold text-slate-600 transition-all hover:bg-pop-blue hover:text-primary" href="/">
                    <span class="material-symbols-outlined text-[20px]">home</span>
                    <span>Home</span>
                </a>
                <a class="group relative flex items-center gap-2 rounded-xl px-4 py-2 font-display font-bold text-slate-600 transition-all hover:bg-pop-blue hover:text-primary" href="#">
                    <span class="material-symbols-outlined text-[20px]">calendar_month</span>
                    <span>Schedule</span>
                </a>
                <a class="group relative flex items-center gap-2 rounded-xl px-4 py-2 font-display font-bold text-slate-600 transition-all hover:bg-pop-blue hover:text-primary" href="#">
                    <span class="material-symbols-outlined text-[20px]">grid_view</span>
                    <span>Browse</span>
                </a>
            </nav>
            <!-- Right Actions -->
            <div class="flex items-center gap-4">
                <!-- Search -->
                <div class="hidden lg:flex relative h-10 w-64 items-center overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50 focus-within:border-primary transition-colors">
                    <span class="material-symbols-outlined absolute left-3 text-slate-400">search</span>
                    <input class="h-full w-full border-none bg-transparent pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:ring-0 outline-none" placeholder="Search anime..." type="text"/>
                </div>
                <!-- Icons -->
                <button class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-transform hover:-translate-y-1 hover:shadow-hard-sm cursor-pointer">
                    <span class="material-symbols-outlined">notifications</span>
                </button>
                <!-- Avatar -->
                <div class="h-10 w-10 rounded-full border-2 border-white bg-slate-200 shadow-md overflow-hidden" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAx63DMvTEdcWFTfTZQasKAR6RRl0kAxEyLkTyAqmRzZYcpyv576YkW5bZ1c14250c2qhOwy14RKmGgWVUIEZsMyG0fOCPkw_XGDNOvECz3s4DAxBYPrS_bk8t-8Gycpjq0mjMmMFqBt5J3bArHdfu9QMXAD1CI6L_r1TMZc0fRMlu2AY9eEykB90GhZMsravemOXI3kl5e_fs7xM386rX5CNzoQy9QHDUrrsPQL9DoN4UV6P-0QEwVFlu7iGLEydL6TfkW3lpSktYH"); background-size: cover;'></div>
            </div>
        </div>
    </div>
</header>

<main class="flex-1 px-4 py-6 w-full max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Content Column -->
        <div class="col-span-1 lg:col-span-12 flex flex-col gap-10">
            
            <!-- Hero Section -->
            {#if heroAnime}
            <section class="relative mx-2 mt-4">
                <a href="/{heroAnime.source}:{heroAnime.slug}" class="relative group cursor-pointer block">
                    <!-- Background decoration -->
                    <div class="absolute inset-0 translate-x-3 translate-y-3 rotate-1 rounded-3xl bg-slate-800/20"></div>
                    <!-- Main Card -->
                    <div class="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-hard-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-hard-xl -rotate-1 group-hover:rotate-0">
                        <!-- Tape Decoration -->
                        <div class="absolute -left-8 top-6 h-12 w-32 -rotate-45 bg-white/30 backdrop-blur-sm shadow-sm z-20 border border-white/40"></div>
                        <div class="absolute -right-8 bottom-6 h-12 w-32 -rotate-45 bg-white/30 backdrop-blur-sm shadow-sm z-20 border border-white/40"></div>
                        
                        <div class="relative aspect-[21/9] w-full bg-cover bg-center" style="background-image: url('{heroAnime.coverImage}');">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                            <div class="absolute bottom-0 left-0 p-8 flex flex-col items-start gap-3 w-full md:w-2/3">
                                <div class="inline-flex -rotate-2 transform items-center rounded-lg border-2 border-white bg-pop-hot px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                                    Latest Update
                                </div>
                                <h2 class="font-display text-4xl md:text-5xl font-extrabold text-white drop-shadow-md leading-tight line-clamp-2">
                                    {heroAnime.title}
                                </h2>
                                <p class="font-body text-slate-100 font-medium line-clamp-2 md:text-lg">
                                    Watch the latest episode now!
                                </p>
                                <div class="mt-2 flex gap-3">
                                    <button class="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-hard-sm transition-transform hover:-translate-y-1 hover:bg-primary-dark border-2 border-white cursor-pointer">
                                        <span class="material-symbols-outlined">play_arrow</span>
                                        Watch Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </section>
            {/if}

            <!-- Chips / Quick Filters -->
            <section class="flex flex-wrap gap-3 px-2">
                <button class="rounded-xl border-2 border-white bg-primary px-4 py-2 font-bold text-white shadow-hard-sm transition-all hover:-translate-y-1 border-primary cursor-pointer">All</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-primary hover:text-white hover:border-primary cursor-pointer">Action</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-primary hover:text-white hover:border-primary cursor-pointer">Slice of Life</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-primary hover:text-white hover:border-primary cursor-pointer">Comedy</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-primary hover:text-white hover:border-primary cursor-pointer">School Life</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-primary hover:text-white hover:border-primary cursor-pointer">Sci-Fi</button>
            </section>

            <!-- Ongoing Section -->
            <section class="flex flex-col gap-4">
                <div class="flex items-end justify-between px-2">
                    <h2 class="text-sticker font-display text-3xl font-extrabold tracking-tight">Ongoing Semester</h2>
                    <a class="group flex items-center gap-1 rounded-lg bg-white/40 px-3 py-1 text-sm font-bold text-slate-900 backdrop-blur-sm transition-colors hover:bg-white/60" href="#">
                        View All <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </a>
                </div>
                {#if data.ongoing.length > 0}
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 pb-4">
                    {#each data.ongoing as anime}
                    <a href="/{anime.source}:{anime.slug}" class="group relative flex flex-col cursor-pointer">
                        <div class="relative aspect-[3/4] overflow-hidden rounded-xl border-4 border-white bg-slate-200 shadow-hard-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-hard-lg">
                            {#if anime.episode}
                            <div class="absolute right-2 top-2 z-10 rotate-3 rounded-md border border-white bg-pop-pink px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                                EP {anime.episode}
                            </div>
                            {/if}
                            <div class="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('{anime.coverImage}');"></div>
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4 pt-12">
                                <div class="flex items-center gap-1 text-xs font-bold text-pop-pink mb-1">
                                    <span class="material-symbols-outlined text-[14px]">schedule</span> Update
                                </div>
                            </div>
                        </div>
                        <div class="mt-3 px-1">
                            <h3 class="font-display text-lg font-bold leading-tight text-white drop-shadow-sm group-hover:text-primary-dark transition-colors" style="text-shadow: 0 1px 2px rgba(0,0,0,0.5);">{anime.title}</h3>
                            <p class="text-sm font-medium text-slate-700">{anime.type || 'TV'} • {anime.source}</p>
                        </div>
                    </a>
                    {/each}
                </div>
                {:else}
                    <p class="px-2 font-medium text-slate-600">No ongoing anime found.</p>
                {/if}
            </section>

            <!-- Completed Section -->
            <section class="flex flex-col gap-4">
                <div class="flex items-end justify-between px-2">
                    <h2 class="text-sticker font-display text-3xl font-extrabold tracking-tight">Completed Archives</h2>
                </div>
                {#if data.completed.length > 0}
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-2">
                    {#each data.completed as anime}
                    <a href="/{anime.source}:{anime.slug}" class="group rounded-xl border-4 border-white bg-pop-paper p-3 shadow-hard-sm hover:shadow-hard-md transition-all hover:-translate-y-1 cursor-pointer block">
                        <div class="aspect-video w-full rounded-lg bg-cover bg-center mb-3 relative overflow-hidden" style="background-image: url('{anime.coverImage}');">
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <h4 class="font-display font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{anime.title}</h4>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-xs font-bold text-slate-400">{anime.type || 'TV'}</span>
                            <span class="material-symbols-outlined text-primary text-[20px] group-hover:scale-110 transition-transform">play_circle</span>
                        </div>
                    </a>
                    {/each}
                </div>
                {:else}
                    <p class="px-2 font-medium text-slate-600">No completed anime found.</p>
                {/if}
            </section>
        </div>
    </div>
</main>
