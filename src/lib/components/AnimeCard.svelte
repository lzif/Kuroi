<script lang="ts">
  import type { AnimeInfo } from '$lib/server/ProviderAdapter';

  let { 
    anime, 
    variant = 'poster', // 'poster' (title inside) | 'details' (title outside)
    showUpdate = false 
  } = $props<{
    anime: AnimeInfo;
    variant?: 'poster' | 'details';
    showUpdate?: boolean;
  }>();
  
  let href = $derived(`/${anime.source}:${anime.slug}`);
  let statusBadge = $derived(anime.episode ? `EP ${anime.episode}` : (anime.status && anime.status.includes('Episode') ? anime.status : null));
</script>

<a {href} class="group relative flex flex-col cursor-pointer">
    <div class="relative aspect-[3/4] overflow-hidden rounded-xl border-4 border-white bg-slate-200 shadow-hard-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-hard-lg">
        {#if statusBadge}
            <div class="absolute right-2 top-2 z-10 rotate-3 rounded-md border border-white bg-pop-hot px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                {statusBadge}
            </div>
        {/if}
        <div class="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('{anime.coverImage}');"></div>
        
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4 pt-12">
            {#if showUpdate}
                <div class="flex items-center gap-1 text-xs font-bold text-pop-pink mb-1">
                    <span class="material-symbols-outlined text-[14px]">schedule</span> Update
                </div>
            {/if}
            {#if variant === 'poster'}
                <h3 class="font-display text-lg font-bold leading-tight text-white group-hover:text-pop-sky transition-colors line-clamp-2">
                    {anime.title}
                </h3>
            {/if}
        </div>
    </div>
    
    {#if variant === 'details'}
        <div class="mt-3 px-1">
            <h3 class="font-display text-lg font-bold leading-tight text-slate-800 drop-shadow-sm group-hover:text-pop-deep transition-colors">{anime.title}</h3>
            <p class="text-sm font-medium text-slate-500">{anime.type || 'TV'} • {anime.source}</p>
        </div>
    {/if}
</a>