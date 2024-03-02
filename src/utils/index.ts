export function slug(slug: string): string {
    const b = slug.split("/");
    const c = b.slice(-2);
    const result = c[0].slice(8);
    return result;
}
export function img(url: string): string {
    const a = url.split("/");
    const b = "https://ik.imagekit.io/i1s54dlkb/" + a.slice(4).join("/");
    return b;
}

export function url(url: string): string {
    const result = url.replace("https://anoboy.pro/", "")
    return result
}

export function getRealSlug(slug: string): string {
    const b = slug.split("/");
    const c = b.slice(-2);
    const result = c[0].slice(8);
    return result;
  }
//console.log(slug("https://anoboy.pro/2024-01-metallic-rouge/"))