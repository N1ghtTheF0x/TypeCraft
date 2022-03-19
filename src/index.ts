import { writeFileSync } from "fs"
import { Client } from "./client"
import { Packet } from "./packets"
import { Entity, LoginRequest, MapChunk, PlayerPositionAndLook, PreChunk } from "./packets/server"
import * as PacketClient from "./packets/client"

const host = "127.0.0.1"
const port = 25565

const username = "NodeJS"

const client = new Client(username,host,port)

var player_interval: NodeJS.Timer

client.on("LoginRequest",function(packet: LoginRequest)
{
    player_interval = setInterval(function()
    {
        client.sendPacket(new PacketClient.Player(false))
    },50)
})
client.on("PreChunk",function(packet: PreChunk)
{
    console.dir(packet.toJSON())
})
client.on("MapChunk",function(packet: MapChunk)
{
    console.dir(packet.toJSON())
})

client.connect()