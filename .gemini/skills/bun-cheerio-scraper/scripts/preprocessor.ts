import { load, type CheerioAPI } from "cheerio";

/**
 * STEP 3: Shrink Repeated Nodes (V2 - Smart Fingerprinting)
 * Aman dari pemotongan struktur layout utama.
 */
function shrinkRepeatedNodes($: CheerioAPI, maxItems: number = 2, listThreshold: number = 4): void {
  $('*').each((_, parent) => {
    const children = $(parent).children();

    // GUARD: Kalau jumlah anaknya dikit (di bawah threshold), berarti ini
    // kemungkinan besar struktur layout (Header, Sidebar, Main), BUKAN list data. Skip!
    if (children.length < listThreshold) return;

    const tagGroups: Record<string, any[]> = {};

    children.each((_, child) => {
      const $child = $(child);
      const tag = child.tagName;
      if (!tag) return;

      // FINGERPRINTING: Tag + First Class (Ide dari test.ts ente)
      // Biar <div class="content"> nggak dianggap sama dengan <div class="sidebar">
      const rawClass = $child.attr('class') || '';
      const firstClass = rawClass.split(/\s+/)[0] || 'noclass';
      const fingerprint = `${tag}.${firstClass}`;

      if (!tagGroups[fingerprint]) tagGroups[fingerprint] = [];
      tagGroups[fingerprint].push(child);
    });

    for (const key in tagGroups) {
      const nodes = tagGroups[key];

      // HANYA eksekusi tebas kalau elemen indentik (Tag+Class sama) jumlahnya beneran panjang
      if (nodes.length >= listThreshold) {
        for (let i = maxItems; i < nodes.length; i++) {
          $(nodes[i]).remove();
        }
      }
    }
  });
}


/**
 * CORE WORKFLOW: Eksekusi Step 1 - 4
 */
export async function generateAgentContext(url: string): Promise<string> {
  // STEP 1: Fetch & Load (Bun Built-in)
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Fetch failed with status: ${response.status}`);
  }

  const rawHtml = await response.text();
  const $ = load(rawHtml);

  // STEP 2: Purge (Sanitization)
  // Menghapus elemen yang bikin halusinasi & boros token
  $('script, style, svg, noscript, iframe, meta, link, .ads, [class*="banner"]').remove();

  // STEP 3: Execute Shrinker
  shrinkRepeatedNodes($);

  // STEP 4: Get HTML
  const minifiedHtml = $('body').html()?.trim() || '';

  return minifiedHtml;
}

// ==========================================
// PENGGUNAAN (Bisa dipanggil dari orchestrator agent ente)
// ==========================================
if (import.meta.main) {
  const targetUrl = process.argv[2];

  if (!targetUrl) {
    console.error("Usage: bun run preprocessor.ts <URL>");
    process.exit(1);
  }

  try {
    console.log(`[+] Pre-processing: ${targetUrl}`);
    const agentContext = await generateAgentContext(targetUrl);

    const outputPath = 'agent-context.html';
    await Bun.write(outputPath, agentContext);

    console.log(`[+] Sukses! Output tersimpan di: ${outputPath}`);
    console.log(`[!] Size: ${(agentContext.length / 1024).toFixed(2)} KB (Siap disuapkan ke LLM)`);
  } catch (error) {
    console.error(`[-] Error:`, error);
  }
}

