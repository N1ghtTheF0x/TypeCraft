import { Packet as _Packet } from "."
import { OBuffer } from "../buffer"
import { MAX_STRING_LENGTH, VERSION } from "../types"

export abstract class Packet extends _Packet
{
    constructor(id: _Packet.Type)
    {
        super(id)
        _Packet.clientside.set(id,typeof this as unknown as typeof _Packet)
    }
}

export class KeepAlive extends Packet
{
    constructor()
    {
        super(0x00)
    }
    toBuffer()
    {
        const buffer = new OBuffer(1)
        buffer.writeByte(this.id)
        return buffer
    }
}

export class LoginRequest extends Packet
{
    readonly username: string
    constructor(username: string)
    {
        super(0x01)
        this.username = username
    }
    toBuffer() 
    {
        const buffer = new OBuffer(23+MAX_STRING_LENGTH)
        buffer.writeByte(this.id)
        buffer.writeInt(VERSION)
        buffer.writeString16(this.username)
        return buffer
    }
}

export class Handshake extends Packet
{
    readonly username: string
    constructor(username: string)
    {
        super(0x02)
        this.username = username
    }
    toBuffer()
    {
        const buffer = new OBuffer(3+MAX_STRING_LENGTH)
        buffer.writeByte(this.id)
        buffer.writeString16(this.username)
        return buffer
    }
}

export class ChatMessage extends Packet
{
    readonly message: string
    constructor(msg: string)
    {
        super(0x03)
        this.message = msg.substring(0,119)
    }
    toBuffer()
    {
        const buffer = new OBuffer(3+(this.message.length*2))
        buffer.writeByte(this.id)
        buffer.writeString16(this.message)
        return buffer    
    }
}

export class EntityEquipment extends Packet
{
    readonly entityID: number
    readonly slot: number
    readonly itemID: number
    readonly damage: number
    constructor(eid: number,s: number,iid: number,d: number)
    {
        super(0x05)
        this.entityID = eid
        this.slot = s
        this.itemID = iid
        this.damage = d
    }
    toBuffer()
    {
        const buffer = new OBuffer(11)
        buffer.writeByte(this.id)
        buffer.writeInt(this.entityID)
        buffer.writeShort(this.slot)
        buffer.writeShort(this.itemID)
        buffer.writeShort(this.damage)
        return buffer
    }
}

export class UseEntity extends Packet
{
    readonly user: number
    readonly target: number
    readonly leftClick: boolean
    constructor(u: number,t: number,lc: boolean)
    {
        super(0x07)
        this.user = u
        this.target = t
        this.leftClick = lc
    }
    toBuffer()
    {
        const buffer = new OBuffer(10)
        buffer.writeByte(this.id)
        buffer.writeInt(this.user)
        buffer.writeInt(this.target)
        buffer.writeBool(this.leftClick)
        return buffer
    }
}

export class Respawn extends Packet
{
    readonly world: number
    constructor(w: number)
    {
        super(0x09)
        this.world = w
    }
    toBuffer()
    {
        const buffer = new OBuffer(2)
        buffer.writeByte(this.id)
        buffer.writeByte(this.world)
        return buffer
    }
}

export class Player extends Packet
{
    readonly onGround: boolean
    constructor(og: boolean)
    {
        super(0x0A)
        this.onGround = og
    }
    toBuffer()
    {
        const buffer = new OBuffer(2)
        buffer.writeByte(this.id)
        buffer.writeBool(this.onGround)
        return buffer    
    }
}

export class PlayerPosition extends Packet
{
    readonly x: number
    readonly y: number
    readonly stance: number
    readonly z: number
    readonly onGround: boolean
    constructor(x: number,y: number,s: number,z: number,og: boolean)
    {
        super(0x0B)
        this.x = x
        this.y = y
        this.stance = s
        this.z = z
        this.onGround = og
    }
    toBuffer() 
    {
        const buffer = new OBuffer(34)
        buffer.writeByte(this.id)
        buffer.writeDouble(this.x)
        buffer.writeDouble(this.y)
        buffer.writeDouble(this.stance)
        buffer.writeDouble(this.z)
        buffer.writeBool(this.onGround)
        return buffer
    }
}
export class PlayerLook extends Packet
{
    readonly yaw: number
    readonly pitch: number
    readonly onGround: boolean
    constructor(y: number,p: number,og: boolean)
    {
        super(0x0C)
        this.yaw = y
        this.pitch = p
        this.onGround = og
    }
    toBuffer(): OBuffer {
        const buffer = new OBuffer(10)
        buffer.writeByte(this.id)
        buffer.writeFloat(this.yaw)
        buffer.writeFloat(this.pitch)
        buffer.writeBool(this.onGround)
        return buffer
    }
}
export class PlayerPositionAndLook extends Packet
{
    readonly x: number
    readonly stance: number
    readonly y: number
    readonly z: number
    readonly yaw: number
    readonly pitch: number
    readonly onGround: boolean
    constructor(x: number,s: number,y: number,z: number,ya: number,p: number,og: boolean)
    {
        super(0x0D)
        this.x = x
        this.stance = s
        this.y = y
        this.z = z
        this.yaw = ya
        this.pitch = p
        this.onGround = og
    }
    toBuffer(): OBuffer {
        const buffer = new OBuffer(42)
        buffer.writeByte(this.id)
        buffer.writeDouble(this.x)
        buffer.writeDouble(this.y)
        buffer.writeDouble(this.stance)
        buffer.writeDouble(this.z)
        buffer.writeFloat(this.yaw)
        buffer.writeFloat(this.pitch)
        buffer.writeBool(this.onGround)
        return buffer
    }
}