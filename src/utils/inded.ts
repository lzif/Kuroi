class Anime { 
    async getCatalog(){
        return await fetch("dnsj")
    }
}

const anime = new Anime()

export { anime }