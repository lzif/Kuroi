<script lang="ts">
  import { FolderOpen, MagnifyingGlass, Bell } from 'phosphor-svelte';
  import { page } from '$app/stores';

  let { links = [
      { href: '/', label: 'Home' },
      { href: '/ongoing', label: 'Ongoing' },
      { href: '/schedule', label: 'Schedule' },
      { href: '/browse', label: 'Browse' }
  ] } = $props<{ links?: { href: string; label: string }[] }>();
</script>

<!-- Top Navigation -->
<header class="relative z-20 w-full px-4 sm:px-8 py-4">
    <nav class="mx-auto max-w-7xl bg-pop-paper/95 backdrop-blur-md rounded-2xl shadow-hard-md border-4 border-white px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-6">
            <!-- Logo -->
            <a class="flex items-center gap-2 group" href="/">
                <div class="size-10 bg-pop-deep rounded-xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-300 shadow-hard-sm border-2 border-white">
                    <FolderOpen weight="bold" class="size-6" />
                </div>
                <span class="text-pop-deep font-display font-bold text-xl tracking-tight hidden sm:block">Kuroi</span>
            </a>
            <!-- Desktop Links -->
            <div class="hidden md:flex items-center gap-6 ml-4">
                {#each links as link}
                    <a 
                        class="font-display font-bold text-sm hover:text-pop-hot transition-colors uppercase tracking-wider {$page.url.pathname === link.href ? 'text-pop-hot' : 'text-slate-600'}" 
                        href={link.href}
                    >
                        {link.label}
                    </a>
                {/each}
            </div>
        </div>
        <!-- Search & Profile -->
        <div class="flex items-center gap-4">
            <div class="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-2 border-2 border-slate-200 focus-within:border-pop-deep transition-colors">
                <MagnifyingGlass weight="bold" class="size-4 text-slate-400 mr-2" />
                <input class="bg-transparent border-none focus:ring-0 text-sm w-32 md:w-48 text-slate-800 placeholder-slate-400 font-medium outline-none" placeholder="Search Kuroi..." type="text"/>
            </div>
            <button aria-label="Notifications" class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-transform hover:-translate-y-1 hover:shadow-hard-sm cursor-pointer">
                <Bell weight="bold" class="size-5" />
            </button>
            <button aria-label="User Profile" class="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAx63DMvTEdcWFTfTZQasKAR6RRl0kAxEyLkTyAqmRzZYcpyv576YkW5bZ1c14250c2qhOwy14RKmGgWVUIEZsMyG0fOCPkw_XGDNOvECz3s4DAxBYPrS_bk8t-8Gycpjq0mjMmMFqBt5J3bArHdfu9QMXAD1CI6L_r1TMZc0fRMlu2AY9eEykB90GhZMsravemOXI3kl5e_fs7xM386rX5CNzoQy9QHDUrrsPQL9DoN4UV6P-0QEwVFlu7iGLEydL6TfkW3lpSktYH');">
            </button>
        </div>
    </nav>
</header>