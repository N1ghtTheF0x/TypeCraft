import { sign } from "crypto";
import { OBuffer } from "../buffer";
import { DataType, Direction, MAX_STRING_LENGTH, VERSION } from "../types";

// https://wiki.vg/index.php?title=Protocol&oldid=510

export const IGNORE_ID_CHECK: boolean = true

export abstract class Packet
{
    readonly id: Packet.Type
    abstract toBuffer(): OBuffer
    constructor(id: Packet.Type)
    {
        this.id = id
    }
    protected checkID(id: Packet.Type)
    {
        if(IGNORE_ID_CHECK) return
        if(this.id != id)
        {
            throw new Error(`Wrong Packet ID! Got ${id}, expected ${this.id}!`)
        }
    }
    toJSON()
    {
        return {...this} as object
    }
    is<Type extends Packet>(clazz: typeof Packet): this is Type
    {
        return this instanceof clazz
    }
}

export namespace Packet
{
    export enum Type
    {
        KeepAlive = 0x00,
        LoginRequest = 0x01,
        Handshake = 0x02,
        ChatMessage = 0x03,
        TimeUpdate = 0x04,
        EntityEquipment = 0x05,
        SpawnPosition = 0x06,
        UseEntity = 0x07,
        UpdateHealth = 0x08,
        Respawn = 0x09,
        Player = 0x0A,
        PlayerPosition = 0x0B,
        PlayerLook = 0x0C,
        PlayerPositionAndLook = 0x0D,
        PlayerDigging = 0x0E,
        PlayerBlockPlacement = 0x0F,
        HoldingChange = 0x10,
        UseBed = 0x11,
        Animation = 0x12,
        EntityAction = 0x13,
        NamedEntitySpawn = 0x14,
        PickupSpawn = 0x15,
        CollectItem = 0x16,
        AddObjectVehicle = 0x17,
        MobSpawn = 0x18,
        EntityPainting = 0x19,
        StanceUpdate = 0x1B,
        EntityVelocity = 0x1c,
        DestroyEntity = 0x1d,
        Entity = 0x1E,
        EntityRelativeMove = 0x1f,
        EntityLook = 0x20,
        EntityLookAndRelativeMove = 0x21,
        EntityTeleport = 0x22,
        EntityStatus = 0x26,
        AttachEntity = 0x27,
        EntityMetadata = 0x28,
        PreChunk = 0x32,
        MapChunk = 0x33,
        MultiBlockChange = 0x34,
        BlockChange = 0x35,
        BlockAction = 0x36,
        Explosion = 0x3C,
        SoundEffect = 0x3D,
        NewInvalidState = 0x46,
        Thunderbolt = 0x47,
        OpenWindow = 0x64,
        CloseWindow = 0x65,
        WindowClick = 0x66,
        SetSlot = 0x67,
        WindowItems = 0x68,
        UpdateProgressBar = 0x69,
        Transaction = 0x6A,
        UpdateSign = 0x82,
        ItemData = 0x83,
        IncrementStatistic = 0x84,
        DisconnectKick = 0xFF
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
            this.message = msg
        }
        toBuffer()
        {
            const buffer = new OBuffer(3+MAX_STRING_LENGTH)
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
}