import { Client } from "../client"

export class App
{
    static readonly instance = new this()
    //readonly nwClient: Client
    readonly username: string

    socket: WebSocket
    private constructor()
    {
        Object.defineProperty(window,"App",{value: this, writable: false})
        const urlsp = new URLSearchParams(location.search)
        if(!urlsp.has("username")) this.username = "NodeJS"
        this.username = urlsp.get("username")
        //this.nwClient = new Client(this.username)
    }
    init()
    {
        //this.nwClient.on("Packets",console.dir)
        //this.nwClient.connect()
    }
    connect(host: string,port: number)
    {
        this.socket = new WebSocket(`ws://${host}:${port}`)
    }
}