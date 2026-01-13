import { scraperManager } from "."

async function main() {
  const home = await scraperManager.getHome()
  const detail = await scraperManager.getAnimeDetail(home.ongoing[0].slug)
  const eps = await scraperManager.getEpisodeList(home.ongoing[0].slug)
  console.log(home, detail, eps)
}
main()
