import { Socket, createConnection } from "net"
import { writeFileSync } from "fs"
import { Client, Packet, Server } from "./packet"
import { OBuffer } from "./buffer"
import { resolve } from "path"

// https://wiki.vg/index.php?title=Protocol&oldid=483

const ip = "127.0.0.1"
const port = 25565

const username = "NodeJS"

var connected = false
var authed = false
var spawned = false

const login = new Client.LoginRequestPacket(username)
const handshake = new Client.HandshakePacket(username)

const socket = createConnection({
    port,
    host: ip,
})

function request(packet: Packet,cb: (data: OBuffer) => void)
{
    const buf = packet.toBuffer()
    socket.write(buf.getBuffer(),console.error)
    socket.once("data",(d) => cb(new OBuffer(d)))
}

function write(name: string,data: Buffer)
{
    return writeFileSync(resolve(process.cwd(),"packets",name),data)
}

const bytes: Buffer[] = []

socket.on("close",function(hadError)
{
    console.info(`Connection Closed${hadError ? ". I got an Error":""}`)
})

socket.on("connect",function()
{
    console.info("Connecting...")
    connected = true
    request(handshake,function(data)
    {
        write("packet-handshake.bin",data.getBuffer())
        const res = new Server.HandshakePacket(data)
        console.dir(res.toJSON())
        authed = true
        request(login,function(data)
        {
            const login_res = new Server.LoginRequestPacket(data)
            console.dir(login_res.toJSON())
            const spawn_res = new Server.SpawnPositionPacket(data)
            console.dir(spawn_res.toJSON())
            const time_res = new Server.TimeUpdatePacket(data)
            console.dir(time_res.toJSON())
        })
    })    
})

socket.on("data",function(data)
{
    const buffer = new OBuffer(data)
    //console.info("Got Data")
    //console.info(`Raw: ${String(data)}`)
    //console.info(`Text: ${data.toString("utf-8")}`)
    bytes.push(data)
})

socket.on("drain",function()
{
    console.info("Draining...")
})

socket.on("end",function()
{
    console.info("End of Connection")
    for(const buf of bytes)
    {
        writeFileSync(`${process.cwd()}/packets/packet-${bytes.indexOf(buf)}.bin`,buf)
    }
})

socket.on("error",console.error)

socket.on("lookup",function(err,address,family,host)
{
    if(err) console.error(err)
    console.info(`Lookup = [${address}] - ${family} (${host})`)
})

socket.on("ready",function()
{
    console.info("Ready to use!")
})

socket.on("timeout",function()
{
    console.info("Timeout")
})