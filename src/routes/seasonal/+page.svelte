<script lang="ts">
    import { Thermometer, ArrowLeft } from 'phosphor-svelte';
</script>

<div class="min-h-screen bg-background-light font-display relative flex items-center justify-center p-4 selection:bg-pop-pink selection:text-white">
  <!-- Background Pattern -->
  <div class="fixed inset-0 z-0 opacity-20 bg-dots pointer-events-none"></div>

  <!-- Main Content Card -->
  <div class="relative z-10 w-full max-w-2xl bg-pop-paper rounded-[2rem] shadow-hard-xl p-8 md:p-12 transform rotate-0 sm:rotate-[-1deg] border-4 border-white text-center">
      <!-- Notebook Lines Pattern Overlay -->
      <div class="absolute inset-0 z-0 bg-notebook opacity-40 pointer-events-none my-8 mx-6 rounded-[2rem]"></div>
      
      <!-- Decorative Tape - Top Center -->
      <div class="tape-strip absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 rotate-[2deg] z-20 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col items-center gap-6 mt-8 sm:mt-12">
          <!-- Icon Container -->
          <div class="relative group">
              <div class="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div class="size-32 bg-white rounded-full border-4 border-slate-900 shadow-hard-md flex items-center justify-center relative z-10 overflow-hidden transform group-hover:scale-110 transition-transform duration-300">
                  <Thermometer weight="bold" class="size-16 text-slate-900" />
              </div>
          </div>

          <!-- Text -->
          <div class="space-y-3">
              <h1 class="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
                  Seasonal Archive
              </h1>
              <p class="text-slate-600 font-bold bg-white/60 p-4 rounded-xl border-2 border-white shadow-sm inline-block mx-auto max-w-md">
                  Filtering the database by broadcast season requires additional index mapping. Module activating soon.
              </p>
          </div>

          <!-- Dummy Data / Placeholder Grid -->
          <div class="w-full flex flex-wrap justify-center gap-3 mt-4">
              <div class="bg-purple-100 border-2 border-purple-300 text-purple-700 font-black px-4 py-2 rounded-xl uppercase text-sm">Spring 2026</div>
              <div class="bg-sky-100 border-2 border-sky-300 text-sky-700 font-black px-4 py-2 rounded-xl uppercase text-sm opacity-60">Winter 2026</div>
              <div class="bg-orange-100 border-2 border-orange-300 text-orange-700 font-black px-4 py-2 rounded-xl uppercase text-sm opacity-60">Fall 2025</div>
              <div class="bg-green-100 border-2 border-green-300 text-green-700 font-black px-4 py-2 rounded-xl uppercase text-sm opacity-60">Summer 2025</div>
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
