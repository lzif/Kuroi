<script lang="ts">
  import type { PageData } from './$types';
  import Navbar from '$lib/components/Navbar.svelte';
  import AnimeCard from '$lib/components/AnimeCard.svelte';
  
  let { data }: { data: PageData } = $props();

  // Helper to get hero anime (first ongoing or first completed)
  let heroAnime = $derived(data.ongoing.length > 0 ? data.ongoing[0] : (data.completed.length > 0 ? data.completed[0] : null));
</script>

<!-- Top Navigation -->
<header class="relative z-20 w-full px-4 sm:px-8 py-4">
    <nav class="mx-auto max-w-7xl bg-pop-paper/95 backdrop-blur-md rounded-2xl shadow-hard-md border-4 border-white px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-6">
            <!-- Logo -->
            <a class="flex items-center gap-2 group" href="/">
                <div class="size-10 bg-pop-deep rounded-xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-300 shadow-hard-sm border-2 border-white">
                    <span class="material-symbols-outlined text-2xl font-bold">folder_open</span>
                </div>
                <span class="text-pop-deep font-display font-bold text-xl tracking-tight hidden sm:block">Kuroi</span>
            </a>
            <!-- Desktop Links -->
            <div class="hidden md:flex items-center gap-6 ml-4">
                <a class="text-slate-600 font-display font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider" href="/">Home</a>
                <a class="text-slate-600 font-display font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider" href="/schedule">Schedule</a>
                <a class="text-slate-600 font-display font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider" href="/browse">Browse</a>
            </div>
        </div>
        <!-- Search & Profile -->
        <div class="flex items-center gap-4">
            <div class="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-2 border-2 border-slate-200 focus-within:border-pop-deep transition-colors">
                <span class="material-symbols-outlined text-slate-400">search</span>
                <input class="bg-transparent border-none focus:ring-0 text-sm w-32 md:w-48 text-slate-800 placeholder-slate-400 font-medium" placeholder="Search Kuroi..." type="text"/>
            </div>
            <button aria-label="Notifications" class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-transform hover:-translate-y-1 hover:shadow-hard-sm cursor-pointer">
                <span class="material-symbols-outlined">notifications</span>
            </button>
            <button aria-label="User Profile" class="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAx63DMvTEdcWFTfTZQasKAR6RRl0kAxEyLkTyAqmRzZYcpyv576YkW5bZ1c14250c2qhOwy14RKmGgWVUIEZsMyG0fOCPkw_XGDNOvECz3s4DAxBYPrS_bk8t-8Gycpjq0mjMmMFqBt5J3bArHdfu9QMXAD1CI6L_r1TMZc0fRMlu2AY9eEykB90GhZMsravemOXI3kl5e_fs7xM386rX5CNzoQy9QHDUrrsPQL9DoN4UV6P-0QEwVFlu7iGLEydL6TfkW3lpSktYH');">
            </button>
        </div>
    </nav>
</header>

<main class="relative z-10 flex-1 px-4 py-6 w-full max-w-7xl mx-auto">
    <!-- Background Pattern -->
    <div class="fixed inset-0 z-0 opacity-20 bg-dots pointer-events-none"></div>
    
    <div class="relative grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                        <div class="tape-strip absolute -top-4 -left-4 w-32 h-10 rotate-[-35deg] z-20 pointer-events-none"></div>
                        <div class="tape-strip absolute -bottom-4 -right-4 w-32 h-10 rotate-[-35deg] z-20 pointer-events-none"></div>
                        
                        <div class="relative aspect-[21/9] w-full bg-cover bg-center" style="background-image: url('{heroAnime.image}');">
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
                                    <button class="flex items-center gap-2 rounded-xl bg-pop-deep px-6 py-3 font-bold text-white shadow-hard-sm transition-transform hover:-translate-y-1 hover:bg-pop-sky border-2 border-white cursor-pointer">
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
                <button class="rounded-xl border-2 border-white bg-pop-deep px-4 py-2 font-bold text-white shadow-hard-sm transition-all hover:-translate-y-1 border-pop-deep cursor-pointer">All</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-pop-deep hover:text-white hover:border-pop-deep cursor-pointer">Action</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-pop-deep hover:text-white hover:border-pop-deep cursor-pointer">Slice of Life</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-pop-deep hover:text-white hover:border-pop-deep cursor-pointer">Comedy</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-pop-deep hover:text-white hover:border-pop-deep cursor-pointer">School Life</button>
                <button class="rounded-xl border-2 border-white bg-pop-paper px-4 py-2 font-bold text-slate-800 shadow-hard-sm transition-all hover:-translate-y-1 hover:bg-pop-deep hover:text-white hover:border-pop-deep cursor-pointer">Sci-Fi</button>
            </section>

            <!-- Ongoing Section -->
            <section class="flex flex-col gap-4">
                <div class="flex items-end justify-between px-2">
                    <h2 class="text-sticker font-display text-3xl font-extrabold tracking-tight">Ongoing Semester</h2>
                    <a class="group flex items-center gap-1 rounded-lg bg-white/40 px-3 py-1 text-sm font-bold text-slate-900 backdrop-blur-sm transition-colors hover:bg-white/60" href="/ongoing">
                        View All <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </a>
                </div>
                {#if data.ongoing.length > 0}
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 pb-4">
                    {#each data.ongoing as anime}
                    <AnimeCard {anime} variant="details" showUpdate={true} />
                    {/each}
                </div>
                {:else}
                    <p class="px-2 font-medium text-slate-600">No ongoing anime found.</p>
                {/if}
            </section>

            <!-- Completed Section -->
            <section class="flex flex-col gap-4">
                <div class="flex items-end justify-between px-2">
                    <h2 class="text-sticker font-display text-3xl font-extrabold tracking-tight">Completed Anime</h2>
                </div>
                {#if data.completed.length > 0}
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-2">
                    {#each data.completed as anime}
                    <a href="/{anime.source}:{anime.slug}" class="group rounded-xl border-4 border-white bg-pop-paper p-3 shadow-hard-sm hover:shadow-hard-md transition-all hover:-translate-y-1 cursor-pointer block">
                        <div class="aspect-video w-full rounded-lg bg-cover bg-center mb-3 relative overflow-hidden" style="background-image: url('{anime.coverImage}');">
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <h4 class="font-display font-bold text-slate-800 line-clamp-1 group-hover:text-pop-deep transition-colors">{anime.title}</h4>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-xs font-bold text-slate-400">{anime.type || 'TV'}</span>
                            <span class="material-symbols-outlined text-pop-deep text-[20px] group-hover:scale-110 transition-transform">play_circle</span>
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
