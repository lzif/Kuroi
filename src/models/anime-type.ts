export type Catalog = {
    url: string;
    title: string;
    eps: string;
    img: string;
}

export type StreamUrls = { res: string; url: string | undefined };
export type DownloadUrls = { provider: string; urls: StreamUrls[] };
export type Info = {
  title: string;
  prevUrl: string | "none";
  nextUrl: string | "none";
};
export type Episode = {
  streamUrl: StreamUrls[];
  downloadUrl: DownloadUrls[];
  info: Info;
};