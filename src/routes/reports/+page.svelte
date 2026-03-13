<script lang="ts">
    import { FolderLock, ArrowLeft } from 'phosphor-svelte';
</script>

<div class="min-h-screen bg-background-light font-display relative flex items-center justify-center p-4 selection:bg-pop-pink selection:text-white">
  <!-- Background Pattern -->
  <div class="fixed inset-0 z-0 opacity-20 bg-dots pointer-events-none"></div>

  <!-- Main Content Card -->
  <div class="relative z-10 w-full max-w-lg bg-pop-paper rounded-[2rem] shadow-hard-xl p-8 md:p-12 transform rotate-0 sm:rotate-[0.5deg] border-4 border-white text-center">
      <!-- Notebook Lines Pattern Overlay -->
      <div class="absolute inset-0 z-0 bg-notebook opacity-40 pointer-events-none my-8 mx-6 rounded-[2rem]"></div>
      
      <!-- Decorative Tape - Top Center -->
      <div class="tape-strip absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 rotate-[-1deg] z-20 pointer-events-none"></div>

      <!-- "RESTRICTED" Stamp -->
      <div class="absolute top-8 left-8 border-4 border-slate-900 text-slate-900 font-black text-2xl px-3 py-1 rotate-[-12deg] pointer-events-none select-none z-0 hidden sm:block shadow-[4px_4px_0px_rgba(15,23,42,1)]">
          RESTRICTED
      </div>
      
      <div class="relative z-10 flex flex-col items-center gap-6 mt-8 sm:mt-12">
          <!-- Icon Container -->
          <div class="relative group">
              <div class="absolute inset-0 bg-slate-900 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div class="size-32 bg-slate-900 rounded-full border-4 border-white shadow-hard-md flex items-center justify-center relative z-10 overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-300">
                  <FolderLock weight="bold" class="size-16 text-white" />
              </div>
          </div>

          <!-- Text -->
          <div class="space-y-3">
              <h1 class="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
                  Status Reports
              </h1>
              <p class="text-slate-600 font-bold bg-white/60 p-4 rounded-xl border-2 border-white shadow-sm inline-block mx-auto max-w-sm">
                  Personal watch history and database statistics require user authentication. Please log in to access this module.
              </p>
          </div>

          <!-- Actions -->
          <div class="w-full flex flex-col gap-3 mt-6">
              <button class="w-full bg-pop-hot hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-hard-sm hover:shadow-hard-md hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 group border-2 border-white cursor-not-allowed opacity-80">
                  CONNECT ACCOUNT
              </button>
              <a href="/" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group border-2 border-white">
                  <ArrowLeft weight="bold" class="size-5 group-hover:-translate-x-1 transition-transform" />
                  RETURN TO HOME
              </a>
          </div>
      </div>
  </div>
</div>
