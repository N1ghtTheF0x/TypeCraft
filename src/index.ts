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

/*

TODO: Find out why the server is not sending a 0x0d? Look at source code of Minecraft?

*/

client.on("Packets",function(packets: Packet[])
{
    for(const packet of packets)
    {
        if(packet.id == 0x0d)
        {
            console.dir(packet)
            process.exit()
        }
    }
})

client.on("end",function()
{
    process.exit()
})

client.connect()