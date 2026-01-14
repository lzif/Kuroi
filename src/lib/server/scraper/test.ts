import { scraperManager } from "."

async function main() {
  const home = await scraperManager.getHome()
  if (home.ongoing.length > 0) {
      const detail = await scraperManager.getAnimeDetail(home.ongoing[0].slug)
      const eps = await scraperManager.getEpisodeList(home.ongoing[0].slug)
      console.log(home, detail, eps)
  } else {
      console.log("No ongoing anime found.")
  }
}
main()
