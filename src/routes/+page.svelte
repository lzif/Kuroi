<script lang="ts">
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-gray-900 text-white p-4 md:p-8">
  <div class="max-w-7xl mx-auto space-y-12">
    
    <!-- Ongoing Anime Section -->
    <section>
      <h2 class="text-2xl font-bold mb-6 text-emerald-400 border-l-4 border-emerald-400 pl-3">Ongoing Anime</h2>
      {#if data.ongoing.length > 0}
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {#each data.ongoing as anime}
            <a href="/{anime.source}:{anime.slug}" class="group relative block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
              <div class="aspect-[3/4] overflow-hidden">
                <img 
                  src={anime.coverImage} 
                  alt={anime.title} 
                  class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {#if anime.episode}
                  <div class="absolute top-2 right-2 bg-emerald-500 text-xs font-bold px-2 py-1 rounded shadow-md">
                    Ep {anime.episode}
                  </div>
                {/if}
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                   <!-- Gradient Overlay -->
                </div>
              </div>
              <div class="p-3">
                <h3 class="font-semibold text-sm line-clamp-2 group-hover:text-emerald-400 transition-colors" title={anime.title}>
                  {anime.title}
                </h3>
                <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span class="capitalize">{anime.type || 'TV'}</span>
                  <span class="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">{anime.source}</span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 italic">No ongoing anime found.</p>
      {/if}
    </section>

    <!-- Completed Anime Section -->
    <section>
      <h2 class="text-2xl font-bold mb-6 text-blue-400 border-l-4 border-blue-400 pl-3">Completed Anime</h2>
      {#if data.completed.length > 0}
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {#each data.completed as anime}
            <a href="/{anime.source}:{anime.slug}" class="group relative block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
              <div class="aspect-[3/4] overflow-hidden">
                <img 
                  src={anime.coverImage} 
                  alt={anime.title} 
                  class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {#if anime.score}
                  <div class="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
                    <span>★</span> {anime.score}
                  </div>
                {/if}
              </div>
              <div class="p-3">
                <h3 class="font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors" title={anime.title}>
                  {anime.title}
                </h3>
                <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span class="capitalize">{anime.type || 'TV'}</span>
                  <span class="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">{anime.source}</span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 italic">No completed anime found.</p>
      {/if}
    </section>

  </div>
</div>
