<script lang="ts">
    import { UsersThree, ArrowLeft, DiscordLogo, GithubLogo } from 'phosphor-svelte';
</script>

<div class="min-h-screen bg-background-light font-display relative flex items-center justify-center p-4 selection:bg-pop-pink selection:text-white">
  <!-- Background Pattern -->
  <div class="fixed inset-0 z-0 opacity-20 bg-dots pointer-events-none"></div>

  <!-- Main Content Card -->
  <div class="relative z-10 w-full max-w-2xl bg-pop-paper rounded-[2rem] shadow-hard-xl p-8 md:p-12 transform rotate-0 sm:rotate-[-0.5deg] border-4 border-white text-center">
      <!-- Notebook Lines Pattern Overlay -->
      <div class="absolute inset-0 z-0 bg-notebook opacity-40 pointer-events-none my-8 mx-6 rounded-[2rem]"></div>
      
      <!-- Decorative Tape - Top Center -->
      <div class="tape-strip absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 rotate-[2deg] z-20 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col items-center gap-6 mt-8 sm:mt-12">
          <!-- Icon Container -->
          <div class="relative group">
              <div class="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div class="size-32 bg-white rounded-full border-4 border-slate-900 shadow-hard-md flex items-center justify-center relative z-10 overflow-hidden transform group-hover:rotate-12 transition-transform duration-300">
                  <UsersThree weight="bold" class="size-16 text-slate-900" />
              </div>
          </div>

          <!-- Text -->
          <div class="space-y-3">
              <h1 class="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
                  Community HUB
              </h1>
              <p class="text-slate-600 font-bold bg-white/60 p-4 rounded-xl border-2 border-white shadow-sm inline-block mx-auto max-w-md">
                  Connect with other archivists, report database anomalies, and contribute to the Kuroi open-source project.
              </p>
          </div>

          <!-- Social Links -->
          <div class="w-full flex flex-col sm:flex-row gap-4 mt-4">
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" class="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 px-6 rounded-xl shadow-hard-sm hover:shadow-hard-md hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border-2 border-white">
                  <DiscordLogo weight="fill" class="size-6" />
                  Join Discord Server
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-hard-sm hover:shadow-hard-md hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border-2 border-white">
                  <GithubLogo weight="fill" class="size-6" />
                  Contribute Code
              </a>
          </div>

          <!-- Actions -->
          <div class="w-full mt-6">
              <a href="/" class="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-4 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group border-2 border-slate-200 hover:border-slate-900">
                  <ArrowLeft weight="bold" class="size-5 group-hover:-translate-x-1 transition-transform" />
                  RETURN TO HOME
              </a>
          </div>
      </div>
  </div>
</div>
