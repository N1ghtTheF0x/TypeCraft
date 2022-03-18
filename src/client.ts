import { createConnection, Socket } from "net"
import { OBuffer } from "./buffer"
import { Packet, Server } from "./packets"

export type ServerResponse = (data: OBuffer) => void

export class Client
{
    protected socket: Socket
    connected: boolean
    loggedIn: boolean
    spawned: boolean
    constructor(readonly username: string,host: string = "127.0.0.1",port: number = 25565)
    {
        this.socket = createConnection({host,port})
        this.socket.on("close",this.onClose.bind(this))
        this.socket.on("connect",this.onConnect.bind(this))
        this.socket.on("data",this.onData.bind(this))
        this.socket.on("drain",this.onDrain.bind(this))
        this.socket.on("error",this.onError.bind(this))
        this.socket.on("lookup",this.onLookup.bind(this))
        this.socket.on("ready",this.onReady.bind(this))
        this.socket.on("timeout",this.onTimeout.bind(this))
        this.socket.on("end",this.onEnd.bind(this))
    }
    sendPacket(packet: Packet,cb: ServerResponse)
    {
        const buf = packet.toBuffer()
        this.socket.write(buf.getBuffer(),console.error)
        this.socket.once("data",(d) => cb(new OBuffer(d)))
    }
    private onClose(hadError: boolean)
    {
        console.info(`[Client] Connection Closed${hadError ? ". I got an Error":""}`)
    }
    private onData(data: Buffer)
    {
        const buffer = new OBuffer(data)
        console.info(buffer.getBuffer())
    }
    private onDrain()
    {
        console.info(`[Client] Draining...`)
    }
    private onError(err: Error)
    {
        console.error(`[Client] Error!\n${err.name}: ${err.message}\n${err.cause}\n${err.stack}`)
    }
    private onLookup(err: Error,address: string,family: string | number,host: string)
    {
        if(err) this.onError(err)
        console.info(`[Client] Lookup (${family}) ${address} => ${host}`)
    }
    private onReady()
    {
        console.info(`[Client] Ready to use!`)
    }
    private onTimeout()
    {
        console.info(`[Client] Timeout!`)
    }
    private onEnd()
    {
        console.info(`[Client] End of Connection`)
    }
    private onConnect()
    {
        console.info(`[Client] Connecting...`)
        this.connected = true
        this.sendPacket(new Packet.Handshake(this.username),this.__doHandshake.bind(this))
    }
    private __doHandshake(data: OBuffer)
    {
        const res = new Server.Handshake(data)
        console.dir(res.toJSON())
        this.sendPacket(new Packet.LoginRequest(this.username),this.__doLogin.bind(this))
    }
    private __doLogin(data: OBuffer)
    {
        const res = new Server.LoginRequest(data)
        console.dir(res.toJSON())
    }
}