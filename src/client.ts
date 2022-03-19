import EventEmitter = require("events")
import { createConnection, Socket } from "net"
import { OBuffer } from "./buffer"
import { Packet } from "./packets"
import { Handshake, LoginRequest, KeepAlive } from "./packets/client"
import * as Server from "./packets/server"
import { TPS } from "./tick"

export type ServerResponse = (data: OBuffer) => void

// https://wiki.vg/index.php?title=How_to_Write_a_Client&oldid=2201

export class Client extends EventEmitter
{
    protected socket: Socket
    host: string
    port: number
    connected: boolean
    loggedIn: boolean
    spawned: boolean
    // TimeUpdate
    ticks: bigint = 0n
    protected __lastTicks: bigint = 0n
    protected __ticks: bigint = 0n
    protected ka_interval: NodeJS.Timer
    // Init Packets
    handshake: Server.Handshake
    loginRequest: Server.LoginRequest
    constructor(readonly username: string,host: string = "127.0.0.1",port: number = 25565)
    {
        super()
        this.host = host
        this.port = port
        this.socket = new Socket()
        this.socket.on("close",this.onClose.bind(this))
        this.socket.on("connect",this.onConnect.bind(this))
        this.socket.on("data",this.onData.bind(this))
        this.socket.on("drain",this.onDrain.bind(this))
        this.socket.on("error",this.onError.bind(this))
        this.socket.on("lookup",this.onLookup.bind(this))
        this.socket.on("ready",this.onReady.bind(this))
        this.socket.on("timeout",this.onTimeout.bind(this))
        this.socket.on("end",this.onEnd.bind(this))
        this.on(Packet.getTypeName(Packet.Type.TimeUpdate),this.__doTimeUpdate.bind(this))
        this.once(Packet.getTypeName(Packet.Type.Handshake),this.__doHandshake.bind(this))
        this.once(Packet.getTypeName(Packet.Type.LoginRequest),this.__doLogin.bind(this))
    }
    connect()
    {
        this.socket.connect({
            host: this.host,
            port: this.port
        })
        return this
    }
    sendPacket(packet: Packet)
    {
        const buf = packet.toBuffer()
        this.socket.write(buf.getBuffer())
    }
    private sendKeepAlivePacket()
    {
        this.sendPacket(new KeepAlive())
    }
    private onClose(hadError: boolean)
    {
        console.info(`[Client] Connection Closed${hadError ? ". I got an Error":""}`)
    }
    private onData(data: Buffer)
    {
        const buffer = new OBuffer(data)
        const packets = Server.parse(buffer)
        this.emit("Packets",packets)
        for(const packet of packets)
        {
            this.emit(Packet.Type[packet.id],packet)
        }
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
        clearInterval(this.ka_interval)
        this.emit("End")
    }
    private onConnect()
    {
        console.info(`[Client] Connecting...`)
        this.connected = true
        this.sendPacket(new Handshake(this.username))
    }
    private __doHandshake(packet: Server.Handshake)
    {
        this.handshake = packet
        console.info(`[Client] Handshake Hash: ${packet.connectionHash}`)
        this.sendPacket(new LoginRequest(this.username))
    }
    private __doLogin(packet: Server.LoginRequest)
    {
        this.loginRequest = packet
        console.info(`[Client] Connected as Entity ID ${packet.entityID}`)
        this.emit("Ready")
        this.ka_interval = setInterval(this.sendKeepAlivePacket.bind(this),TPS*30)
    }
    private __doTimeUpdate(packet: Server.TimeUpdate)
    {
        this.__ticks = packet.time
        if(this.__lastTicks != 0n) this.ticks += this.__ticks - this.__lastTicks
        this.__lastTicks = this.__ticks
    }
}