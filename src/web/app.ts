import { Client } from "../client"

export class App
{
    static readonly instance = new this()
    readonly nwClient: Client
    readonly username: string
    private constructor()
    {
        const urlsp = new URLSearchParams(location.search)
        if(!urlsp.has("username")) this.username = "NodeJS"
        this.username = urlsp.get("username")
        this.nwClient = new Client(this.username)
    }
}