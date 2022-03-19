import { writeFileSync } from "fs"
import { Client } from "./client"
import { Packet } from "./packets"
import { ChatMessage, Entity, LoginRequest, MapChunk, NamedEntitySpawn, PlayerPositionAndLook, PreChunk, TimeUpdate, UpdateHealth } from "./packets/server"
import * as PacketClient from "./packets/client"
import { randomBytes } from "crypto"
import { TPS } from "./tick"
import { OBuffer } from "./buffer"

const host = "127.0.0.1"
const port = 25565

const username = randomBytes(4).toString("hex")

const client = new Client(username,host,port)

const list = []

client.on("Ready",function()
{
    setTimeout(function()
    {
        writeFileSync("packets.json",JSON.stringify(list,function(key,value)
        {
            if(typeof value == "bigint") return value.toString()
            if(key == "id") return Packet.Type[value]
            if(value instanceof OBuffer) return `Buffer[${value.getBuffer().length}]`
            return value
        }),"utf-8")
        process.exit()
    },1000*5)
})

client.on("Packets",function(packets: Packet[])
{
    list.push(...packets)
})

client.on("end",function()
{
    process.exit()
})

client.connect()