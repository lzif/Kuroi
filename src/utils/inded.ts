export async function getAnimeCatalog(){
    const response = await fetch('https://api.jikan.moe/v3/top/anime/1/bypopularity')
    const data = await response.json()
    return data
}

export async function getMangaCatalog(){
    const response = await fetch('https://api.jikan.moe/v3/top/manga/1/bypopularity')
    const data = await response.json()
    return data
}

export async function getAnime(id: string){
    const response = await fetch(`https://api.jikan.moe/v3/anime/${id}`)
    const data = await response.json()
    return data
}

export async function getManga(id: string){
    const response = await fetch(`https://api.jikan.moe/v3/manga/${id}`)
    const data = await response.json()
    return data
}

export async function searchAnime(query: string){
    const response = await fetch(`https://api.jikan.moe/v3/search/anime?q=${query}`)
    const data = await response.json()
    return data
}

export async function searchManga(query: string){
    const response = await fetch(`https://api.jikan.moe/v3/search/manga?q=${query}`)
    const data = await response.json()
    return data
}

export async function getGenreList(){
    const response = await fetch('https://api.jikan.moe/v3/genre/anime')
    const data = await response.json()
    return data
}

export async function getGenre(id: string){
    const response = await fetch(`https://api.jikan.moe/v3/genre/anime/${id}`)
    const data = await response.json()
    return data
}

export async function getSeasonList(){
    const response = await fetch('https://api.jikan.moe/v3/season/archive')
    const data = await response.json()
    return data
}

export async function getSeason(year: string, season: string){
    const response = await fetch(`https://api.jikan.moe/v3/season/${year}/${season}`)
    const data = await response.json()
    
    return 's'
}