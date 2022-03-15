import { webcrypto } from "crypto";
import { OBuffer } from "./buffer";
import { DataType, Direction, MAX_STRING_LENGTH, VERSION } from "./types";

export const IGNORE_ID_CHECK: boolean = true

export abstract class Packet
{
    readonly id: number
    abstract toBuffer(): OBuffer
    constructor(id: number)
    {
        this.id = id
    }
    protected checkID(id: number)
    {
        if(IGNORE_ID_CHECK) return
        if(this.id != id)
        {
            throw new Error(`Wrong Packet ID! Got ${id}, expected ${this.id}!`)
        }
    }
    toJSON()
    {
        return JSON.stringify(this)
    }
}

export abstract class ServerPacket extends Packet
{
    readonly raw: OBuffer
    constructor(buffer: OBuffer,id: number)
    {
        super(id)
        this.raw = buffer
        
    }
    toBuffer()
    {
        return this.raw
    }
}

export type Metadata = number[]

export namespace Client
{
    export class KeepAlivePacket extends Packet
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
    
    export class LoginRequestPacket extends Packet
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
    
    export class HandshakePacket extends Packet
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
    
    export class ChatMessagePacket extends Packet
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

    export class EntityEquipmentPacket extends Packet
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

    export class UseEntityPacket extends Packet
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

    export class RespawnPacket extends Packet
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

    export class PlayerPacket extends Packet
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

    export class PlayerPositionPacket extends Packet
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
    export class PlayerLookPacket extends Packet
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
    export class PlayerPositionAndLookPacket extends Packet
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

export namespace Server
{
    export class KeepAlivePacket extends ServerPacket
    {
        constructor(buffer: OBuffer)
        {
            super(buffer,0x00)
            
            
        }
        toBuffer()
        {
            const buffer = new OBuffer(1)
            buffer.writeByte(this.id)
            return buffer
        }
    }
    export class LoginRequestPacket extends ServerPacket
    {
        readonly entityID: number
        readonly _string1: string
        readonly mapSeed: bigint
        readonly dimension: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x01)
            
            
            this.entityID = buffer.readInt()
            this._string1 = buffer.readString16()
            this.mapSeed = buffer.readLong()
            this.dimension = buffer.readByte()
        }
    }
    export class HandshakePacket extends ServerPacket
    {
        readonly connectionHash: string
        constructor(buffer: OBuffer)
        {
            super(buffer,0x02)
            
            
            this.connectionHash = buffer.readString16()
        }
    }
    export class TimeUpdatePacket extends ServerPacket
    {
        readonly time: bigint
        constructor(buffer: OBuffer)
        {
            super(buffer,0x04)
            
            
            this.time = buffer.readLong()
        }
    }
    export class EntityEquipmentPacket extends ServerPacket
    {
        readonly entityID: number
        readonly slot: number
        readonly itemID: number
        readonly _short1: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x05)
            
            
            this.entityID = buffer.readInt()
            this.slot = buffer.readShort()
            this.itemID = buffer.readShort()
            this._short1 = buffer.readShort()
        }
    }
    export class SpawnPositionPacket extends ServerPacket
    {
        readonly x: number
        readonly y: number
        readonly z: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x06)
            
            
            this.x = buffer.readInt()
            this.y = buffer.readInt()
            this.z = buffer.readInt()
        }
    }
    export class UseEntityPacket extends ServerPacket
    {
        readonly user: number
        readonly target: number
        readonly leftClick: boolean
        constructor(buffer: OBuffer)
        {
            super(buffer,0x07)
            
            
            this.user = buffer.readInt()
            this.target = buffer.readInt()
            this.leftClick = buffer.readBool()
        }
    }
    export class UpdateHealthPacket extends ServerPacket
    {
        readonly health: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x08)
            
            
            this.health = buffer.readShort()
        }
    }
    export class RespawnPacket extends ServerPacket
    {
        readonly world: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x09)
            
            
            this.world = buffer.readByte()
        }
    }
    export class PlayerPositionAndLookPacket extends ServerPacket
    {
        readonly x: number
        readonly y: number
        readonly stance: number
        readonly z: number
        readonly yaw: number
        readonly pitch: number
        readonly onGround: boolean
        constructor(buffer: OBuffer)
        {
            super(buffer,0x0D)
            
            
            this.x = buffer.readDouble()
            this.y = buffer.readDouble()
            this.stance = buffer.readDouble()
            this.z = buffer.readDouble()
            this.yaw = buffer.readFloat()
            this.pitch = buffer.readFloat()
            this.onGround = buffer.readBool()
        }
    }
    export enum PlayerDiggingStatus
    {
        Started = 0,
        Finished = 2,
        DropItem = 6
    }
    export class PlayerDiggingPacket extends ServerPacket
    {
        readonly status: PlayerDiggingStatus
        readonly x: number
        readonly y: number
        readonly z: number
        readonly face: Direction
        constructor(buffer: OBuffer)
        {
            super(buffer,0x0E)
            
            this.status = buffer.readByte()
            this.x = buffer.readInt()
            this.y = buffer.readByte()
            this.z = buffer.readInt()
            this.face = buffer.readByte()
        }
    }
    export class PlayerBlockPlacementPacket extends ServerPacket
    {
        readonly x: number
        readonly y: number
        readonly z: number
        readonly direction: Direction
        readonly pid: number
        readonly amount?: number
        readonly damage?: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x0F)
            this.x = buffer.readInt()
            this.y = buffer.readByte()
            this.z = buffer.readInt()
            this.direction = buffer.readByte()
            this.pid = buffer.readShort()
            if(this.pid >= 0)
            {
                this.amount = buffer.readByte()
                this.damage = buffer.readShort()
            } 
        }
    }
    export class HoldingChangePacket extends ServerPacket
    {
        readonly slotID: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x10)
            this.slotID = buffer.readShort()
        }
    }
    export class UseBedPacket extends ServerPacket
    {
        readonly entityID: number
        readonly inBed: number
        readonly x: number
        readonly y: number
        readonly z: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x11)
            this.entityID = buffer.readInt()
            this.inBed = buffer.readByte()
            this.x = buffer.readInt()
            this.y = buffer.readByte()
            this.z = buffer.readInt()
        }
    }
    export enum AnimationType
    {
        None = 0,
        SwingArm = 1,
        Damage = 2,
        LeaveBed = 3,
        Crouch = 104,
        Uncrouch = 105,
    }
    export class AnimationPacket extends ServerPacket
    {
        readonly entityID: number
        readonly animate: AnimationType
        constructor(buffer: OBuffer)
        {
            super(buffer,0x12)
            this.entityID = buffer.readInt()
            this.animate = buffer.readByte()
        }
    }
    export enum EntityActionType
    {
        Crouch = 1,
        Uncrouch = 2,
        LeaveBed = 3
    }
    export class EntityActionPacket extends ServerPacket
    {
        readonly entityID: number
        readonly action: EntityActionType
        constructor(buffer: OBuffer)
        {
            super(buffer,0x13)
            this.entityID = buffer.readInt()
            this.action = buffer.readByte()
        }
    }
    export class NamedEntitySpawnPacket extends ServerPacket
    {
        readonly entityID: number
        readonly playername: string
        readonly x: number
        readonly y: number
        readonly z: number
        readonly rotation: number
        readonly pitch: number
        readonly currentItem: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x014)
            this.entityID = buffer.readInt()
            this.playername = buffer.readString16()
            this.x = buffer.readInt()
            this.y = buffer.readInt()
            this.z = buffer.readInt()
            this.rotation = buffer.readByte()
            this.pitch = buffer.readByte()
            this.currentItem = buffer.readShort()
        }
    }
    export class PickupSpawnPacket extends ServerPacket
    {
        readonly entityID: number
        readonly item: number
        readonly count: number
        readonly data: number
        readonly x: number
        readonly y: number
        readonly z: number
        readonly rotation: number
        readonly pitch: number
        readonly roll: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x15)
            this.entityID = buffer.readInt()
            this.item = buffer.readShort()
            this.count = buffer.readByte()
            this.data = buffer.readShort()
            this.x = buffer.readInt()
            this.y = buffer.readInt()
            this.z = buffer.readInt()
            this.rotation = buffer.readByte()
            this.pitch = buffer.readByte()
            this.roll = buffer.readByte()
        }
    }
    export class CollectItem extends ServerPacket
    {
        readonly collectedID: number
        readonly collectorID: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x016)
            this.collectedID = buffer.readInt()
            this.collectorID = buffer.readInt()
        }
    }
    export enum AddObjectVehicleType
    {
        Boats = 1,
        Minecart = 10,
        StorageCart = 11,
        PoweredCart = 12,
        ActivatedTNT = 50,
        Arrow = 60,
        ThrownSnowball = 61,
        ThrownEgg = 62,
        FallingSand = 70,
        FallingGravel = 71,
        FishingFloat = 90
    }
    export class AddObjectVehiclePacket extends ServerPacket
    {
        readonly entityID: number
        readonly type: AddObjectVehicleType
        readonly x: number
        readonly y: number
        readonly z: number
        readonly _int1: number
        readonly _short1?: number
        readonly _short2?: number
        readonly _short3?: number   
        constructor(buffer: OBuffer)
        {
            super(buffer,0x17)
            this.entityID = buffer.readInt()
            this.type = buffer.readByte()
            this.x = buffer.readInt()
            this.y = buffer.readInt()
            this.z = buffer.readInt()
            this._int1 = buffer.readInt()
            if(this._int1 > 0)
            {
                this._short1 = buffer.readShort()
                this._short2 = buffer.readShort()
                this._short3 = buffer.readShort()
            }
        }
    }
    export enum MobSpawnType
    {
        Creeper = 50,
        Skeleton = 51,
        Spider = 52,
        GiantZombie = 53,
        Zombie = 54,
        Slime = 55,
        Ghast = 56,
        ZombiePigman = 57,
        Pig = 90,
        Sheep = 91,
        Cow = 92,
        Chicken = 93,
        Squid = 94,
        Wolf = 95
    }
    export class MobSpawnPacket extends ServerPacket
    {
        readonly entityID: number
        readonly type: MobSpawnType
        readonly x: number
        readonly y: number
        readonly z: number
        readonly yaw: number
        readonly pitch: number
        readonly data
        constructor(buffer: OBuffer)
        {
            super(buffer,0x18)
            this.entityID = buffer.readInt()
            this.type = buffer.readByte()
            this.x = buffer.readInt()
            this.y = buffer.readInt()
            this.z = buffer.readInt()
            this.yaw = buffer.readByte()
            this.pitch = buffer.readByte()
        }
    }
}

