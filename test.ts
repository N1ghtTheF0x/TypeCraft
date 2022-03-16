import { appendFileSync } from "fs"
import { OBuffer } from "./src/buffer"
import { Packet, Server } from "./src/packet"



for(const [name,index] of Object.entries(Packet.Type))
{
    if(typeof index != "number") continue
    var text = "case Packet.Type."
    text += `${name}:\n`
    text += `\tarr.push(new Server.${name}Packet(data))\n`
    text += "\tbreak\n"
    appendFileSync("test.txt",text,"utf-8")
}