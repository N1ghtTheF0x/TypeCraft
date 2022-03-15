import { createServer, Socket } from "net";

const server = createServer()

class Player
{
    readonly socket: Socket
    loggedIn: boolean = false
    handshake: boolean = false
    username: string
    constructor(s: Socket)
    {
        this.socket = s
    }
}

const players = new Map<string,Player>()

server.on("close",function()
{
    console.info("[Server] Closing")
})
server.on("connection",function(socket)
{
    const id = `${socket.localAddress}:${socket.localPort}`
    if(!players.has(id))
    {
        players.set(id,new Player(socket))
    }
    console.info(`[Server] Socket ${id} connecting!`)
    socket.on("close",function(hadError)
    {
        console.info(`[Server] Socket ${id} closed!`)
    })
    socket.on("connect",function()
    {
        console.info(`[Server] Socket ${id} connecting...`)
    })
    socket.on("data",function(data)
    {
        console.info(`[Server] Socket ${id} send data:`)
        console.info(`Raw:`)
        console.dir(data.buffer)
        console.info(`Text: ${data.toString()}\n`)
        if(players.has(id))
        {
            const player = players.get(id)
            if(!player.handshake)
            {
                player.handshake = true
                player.username = data.toString()
                
                const buffer = Buffer.alloc(3+16)
                buffer.writeInt8(0x02,0)
                //socket.write(buffer)
            }
        }
    })
})
server.on("error",function(err)
{
    console.info(`[Server] Error:\n\n${err}`)
})
server.on("listening",function()
{
    console.info("[Server] Listening for clients...")
})

server.listen(25565)