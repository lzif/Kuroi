<script lang="ts">
  import type { PageData } from './$types';
  import { Television, ArrowLeft, FolderOpen } from 'phosphor-svelte';
  
  let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-background-light font-display relative selection:bg-pop-pink selection:text-white">
  <!-- Background Pattern -->
  <div class="fixed inset-0 z-0 opacity-20 bg-dots pointer-events-none"></div>

  <!-- Header/Navigation -->
  <header class="relative z-20 w-full px-4 sm:px-8 py-4">
      <nav class="mx-auto max-w-7xl bg-pop-paper/95 backdrop-blur-md rounded-2xl shadow-hard-md border-4 border-white px-6 py-3 flex items-center justify-between">
          <div class="flex items-center gap-6">
              <a class="flex items-center gap-2 group" href="/">
                  <div class="size-10 bg-pop-deep rounded-xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-300 shadow-hard-sm border-2 border-white">
                      <FolderOpen weight="bold" class="size-6" />
                  </div>
                  <span class="text-pop-deep font-display font-bold text-xl tracking-tight hidden sm:block">Kuroi</span>
              </a>
              <div class="hidden md:flex items-center gap-6 ml-4">
                  <a class="text-slate-600 font-display font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider" href="/">Home</a>
                  <a class="text-slate-600 font-display font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider text-pop-hot" href="/ongoing">Ongoing</a>
              </div>
          </div>
      </nav>
  </header>

  <main class="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-20">
      
      <!-- Header -->
      <div class="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-4 border-white pb-6">
          <div class="flex items-center gap-4">
              <div class="size-16 bg-pop-hot text-white rounded-2xl border-4 border-white shadow-hard-sm flex items-center justify-center transform -rotate-3">
                  <Television weight="bold" class="size-8" />
              </div>
              <div>
                  <h1 class="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">Ongoing</h1>
                  <p class="text-slate-500 font-bold">Currently airing semester</p>
              </div>
          </div>
          <span class="text-slate-500 font-bold bg-white px-4 py-2 rounded-xl border-2 border-slate-200 shadow-sm">Page {data.page}</span>
      </div>

      <!-- Results Grid -->
      {#if data.results.length > 0}
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {#each data.results as anime}
              <a href="/{anime.source}:{anime.slug}" class="group relative flex flex-col cursor-pointer">
                  <div class="relative aspect-[3/4] overflow-hidden rounded-xl border-4 border-white bg-slate-200 shadow-hard-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-hard-lg">
                      {#if anime.status && anime.status.includes('Episode')}
                          <div class="absolute right-2 top-2 z-10 rotate-3 rounded-md border border-white bg-pop-hot px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                              {anime.status}
                          </div>
                      {/if}
                      <div class="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('{anime.coverImage}');"></div>
                      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4 pt-12">
                          <h3 class="font-display text-lg font-bold leading-tight text-white group-hover:text-pop-sky transition-colors line-clamp-2">
                              {anime.title}
                          </h3>
                      </div>
                  </div>
              </a>
              {/each}
          </div>

          <!-- Pagination -->
          <div class="mt-12 flex justify-center gap-4">
              {#if data.page > 1}
                  <a href="/ongoing?page={data.page - 1}" class="bg-white text-slate-800 font-bold py-3 px-6 rounded-xl border-4 border-slate-900 shadow-hard-sm hover:-translate-y-1 hover:shadow-hard-md transition-all">
                      Previous
                  </a>
              {/if}
              {#if data.hasNextPage}
                  <a href="/ongoing?page={data.page + 1}" class="bg-pop-hot text-white font-bold py-3 px-6 rounded-xl border-4 border-slate-900 shadow-hard-sm hover:-translate-y-1 hover:shadow-hard-md transition-all">
                      Next Page
                  </a>
              {/if}
          </div>
      {:else}
          <div class="bg-white/60 rounded-[2rem] border-4 border-white p-12 text-center shadow-hard-sm">
              <p class="text-xl text-slate-500 font-bold">No ongoing anime found.</p>
          </div>
      {/if}
  </main>
</div>
