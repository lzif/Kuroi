import { load } from 'cheerio'

async function extractStreamLinks(episodeUrl: string) {
  console.log(`[Adapter] Extracting iframes from: ${episodeUrl}`);

  // 1. Fetch halaman utama buat ngambil Cookie & Parameter
  const res = await fetch(episodeUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });

  if (!res.ok) throw new Error(`[Adapter] Gagal fetch halaman episode: ${res.status}`);

  const html = await res.text();
  const cookies = res.headers.get('set-cookie') || "";
  const $ = load(html);

  const streamLinks: { server: string, url: string }[] = [];
  const ajaxTasks: Promise<void>[] = []; // Buat jalanin fetch secara paralel

  // 2. Loop semua tombol server yang ada
  $('div#server > ul > li').each((_, li) => {
    const div = $(li).find('div');
    const post = div.attr('data-post');
    const nume = div.attr('data-nume');
    const type = div.attr('data-type');
    const serverName = $(li).find('span').text().trim();

    if (!post) return; // Skip kalau atributnya kosong

    // 3. Tembak backend WordPress AJAX-nya
    const body = new URLSearchParams({ action: 'player_ajax', post, nume, type });

    const task = fetch(`https://v2.samehadaku.how/wp-admin/admin-ajax.php`, {
      method: 'POST',
      body: body.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'Referer': episodeUrl, // Penting! Bypass proteksi hotlink
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    }).then(async (ajaxRes) => {
      const ajaxHtml = await ajaxRes.text();
      const $$ = load(ajaxHtml);
      const iframeUrl = $$('iframe').attr('src');

      if (iframeUrl) {
        streamLinks.push({ server: serverName, url: iframeUrl });
      }
    }).catch(err => console.error(`[Adapter] Gagal extract server ${serverName}:`, err.message));

    ajaxTasks.push(task);
  });

  // Tunggu semua request AJAX selesai barengan
  await Promise.all(ajaxTasks);

  return streamLinks;
}

extractStreamLinks("https://v2.samehadaku.how/akujiki-reijou-to-kyouketsu-koushaku-episode-12-end/").then(console.log)

