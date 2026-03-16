<script lang="ts">
  import type { PageData } from './$types';
  import { Television, ArrowLeft, FolderOpen } from 'phosphor-svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import AnimeCard from '$lib/components/AnimeCard.svelte';
  
  let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-background-light font-display relative selection:bg-pop-pink selection:text-white">
  <!-- Background Pattern -->
  <div class="fixed inset-0 z-0 opacity-20 bg-dots pointer-events-none"></div>

  <!-- Header/Navigation -->
  <Navbar />

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
              <AnimeCard {anime} />
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