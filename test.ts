import { Client } from "./src/packet"

const p = new Client.PlayerPositionAndLookPacket(0,1,2,3,4,5,true)

console.info(JSON.stringify(p))