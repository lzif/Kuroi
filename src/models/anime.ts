import * as cheerio from "cheerio";
import * as format from "../utils/"
import type { Catalog, DownloadUrls, Episode, Info, StreamUrls } from "./anime-type.ts"

class AnimeScraper {
    // get data for home
    async getCatalog() {
        const res = await fetch("https://anoboy.pro/");
        const html = await res.text();
        const $ = cheerio.load(html);
        const data: Catalog[] = [];
        $("div.container > .main-col > .xrelated-box > .xrelated").each((i, el) => {
            const url = "/anime" + format.url($(el).find("a").attr("href")!);
            const img = format.img($(el).find("img").attr("src")!);
            const eps = $(el).find(".eplist").text();
            const title = $(el).find(".titlelist").text();

            data.push({ url, title, eps, img });
        });
        return data;
    }

    private async getEpisodeStream($: cheerio.CheerioAPI): Promise<StreamUrls[]> {
        let YUpUrl;
        $("div.vmiror:contains('YUp')").each((_, el) => {
            const url = $(el).find("a").attr("data-video");
            YUpUrl = url;
        });

        const resData = await fetch(`https://anoboy.show${YUpUrl}`);
        const yup = await resData.text();
        const yupHtml = cheerio.load(yup);

        const realUrls: StreamUrls[] = [];
        yupHtml("a.link").each((_, el) => {
            const a = yupHtml(el).attr("href");
            const res = yupHtml(el).text().trim();
            realUrls.push({ res, url: a });
        });
        return realUrls;
    }

    private getEpisodeDownload(
        $: cheerio.CheerioAPI,
    ): DownloadUrls[] {
        const downloadUrl: DownloadUrls[] = [];
        $("div.download > div#colomb > p > span").each((_, el) => {
            const provider = $(el).find("span").text();
            const urls: StreamUrls[] = [];
            $(el)
                .find("a")
                .each((_, el) => {
                    const res = $(el).text();
                    const url = $(el).attr("href");
                    urls.push({ res, url });
                });
            downloadUrl.push({ provider, urls });
        });
        return downloadUrl;
    }

    private getEpisodeInfo($: cheerio.CheerioAPI): Info {
        const title = $("div.pagetitle > h1").text();
        const prevUrl = $("i.fa-fast-backward").parent().attr("href") || "none";
        const nextUrl = $("i.fa-fast-forward").parent().find("a").attr("href") ||
            "none";
        const info: Info = { title, prevUrl, nextUrl };
        return info;
    }

    async getEpisodeData(slug: string): Promise<Episode> {
        const realSlug = format.getRealSlug(slug);
        const res = await fetch(`https://anoboy.show/${realSlug}/`);
        const html = await res.text();
        const $: cheerio.CheerioAPI = cheerio.load(html);
        const [streamUrl, downloadUrl, info] = await Promise.all([
            this.getEpisodeStream($),
            this.getEpisodeDownload($),
            this.getEpisodeInfo($),
        ]);
        console.log({ info, streamUrl, downloadUrl });
        return { info, streamUrl, downloadUrl };
    }
}

const anime = new AnimeScraper()

export default anime