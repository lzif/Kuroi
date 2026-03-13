<script lang="ts">
    import { CalendarBlank, ArrowLeft } from 'phosphor-svelte';
</script>

<div class="min-h-screen bg-background-light font-display relative flex items-center justify-center p-4 selection:bg-pop-pink selection:text-white">
  <!-- Background Pattern -->
  <div class="fixed inset-0 z-0 opacity-20 bg-dots pointer-events-none"></div>

  <!-- Main Content Card -->
  <div class="relative z-10 w-full max-w-2xl bg-pop-paper rounded-[2rem] shadow-hard-xl p-8 md:p-12 transform rotate-0 sm:rotate-[1deg] border-4 border-white text-center">
      <!-- Notebook Lines Pattern Overlay -->
      <div class="absolute inset-0 z-0 bg-notebook opacity-40 pointer-events-none my-8 mx-6 rounded-[2rem]"></div>
      
      <!-- Decorative Tape - Top Center -->
      <div class="tape-strip absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 rotate-[-2deg] z-20 pointer-events-none"></div>

      <!-- "MODULE" Stamp -->
      <div class="absolute top-8 left-8 border-4 border-slate-300/40 text-slate-300/40 font-black text-2xl px-3 py-1 rotate-[-12deg] pointer-events-none select-none z-0 hidden sm:block">
          MODULE
      </div>
      
      <div class="relative z-10 flex flex-col items-center gap-6 mt-8 sm:mt-12">
          <!-- Icon Container -->
          <div class="relative group">
              <div class="absolute inset-0 bg-pop-sky rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div class="size-32 bg-white rounded-full border-4 border-slate-900 shadow-hard-md flex items-center justify-center relative z-10 overflow-hidden transform group-hover:rotate-[-12deg] transition-transform duration-300">
                  <CalendarBlank weight="bold" class="size-16 text-slate-900" />
              </div>
          </div>

          <!-- Text -->
          <div class="space-y-3">
              <h1 class="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
                  Release Schedule
              </h1>
              <p class="text-slate-600 font-bold bg-white/60 p-4 rounded-xl border-2 border-white shadow-sm inline-block mx-auto max-w-md">
                  We are currently synchronizing the weekly airing schedule with the AniList database. Check back soon.
              </p>
          </div>

          <!-- Dummy Data / Placeholder Grid -->
          <div class="w-full grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-left">
              {#each ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekend'] as day}
                  <div class="bg-white/50 border-2 border-slate-200 rounded-xl p-3 opacity-60">
                      <h3 class="font-black text-slate-800 text-sm uppercase">{day}</h3>
                      <div class="h-2 bg-slate-200 rounded-full w-3/4 mt-2"></div>
                      <div class="h-2 bg-slate-200 rounded-full w-1/2 mt-1"></div>
                  </div>
              {/each}
          </div>

          <!-- Actions -->
          <div class="w-full mt-6">
              <a href="/" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-hard-sm hover:shadow-hard-md hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 group border-2 border-white">
                  <ArrowLeft weight="bold" class="size-5 group-hover:-translate-x-1 transition-transform" />
                  RETURN TO DIRECTORY
              </a>
          </div>
      </div>
  </div>
</div>
