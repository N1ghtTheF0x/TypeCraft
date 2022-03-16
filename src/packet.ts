import { sign } from "crypto";
import { OBuffer } from "./buffer";
import { DataType, Direction, MAX_STRING_LENGTH, VERSION } from "./types";

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

export namespace Server
{
    export abstract class Packet extends (await import("./packet")).Packet
    {
        readonly raw: OBuffer
        constructor(buffer: OBuffer,id: Packet.Type)
        {
            super(id)
            this.raw = buffer
            this.checkID(buffer.readByte())
            
        }
        toBuffer()
        {
            return this.raw
        } 
    }

    export function parse(data: OBuffer)
    {
        const arr: Packet[] = []
        const type = data.readByte() as Packet.Type
        switch(type)
        {
            case Packet.Type.KeepAlive:
                arr.push(new Server.KeepAlive(data))
                break
            case Packet.Type.LoginRequest:
                arr.push(new Server.LoginRequest(data))
                break
            case Packet.Type.Handshake:
                arr.push(new Server.Handshake(data))
                break
            case Packet.Type.ChatMessage:
                arr.push(new Server.ChatMessage(data))
                break
            case Packet.Type.TimeUpdate:
                arr.push(new Server.TimeUpdate(data))
                break
            case Packet.Type.EntityEquipment:
                arr.push(new Server.EntityEquipment(data))
                break
            case Packet.Type.SpawnPosition:
                arr.push(new Server.SpawnPosition(data))
                break
            case Packet.Type.UseEntity:
                arr.push(new Server.UseEntity(data))
                break
            case Packet.Type.UpdateHealth:
                arr.push(new Server.UpdateHealth(data))
                break
            case Packet.Type.Respawn:
                arr.push(new Server.Respawn(data))
                break
            case Packet.Type.PlayerPositionAndLook:
                arr.push(new Server.PlayerPositionAndLook(data))
                break
            case Packet.Type.PlayerDigging:
                arr.push(new Server.PlayerDigging(data))
                break
            case Packet.Type.PlayerBlockPlacement:
                arr.push(new Server.PlayerBlockPlacement(data))
                break
            case Packet.Type.HoldingChange:
                arr.push(new Server.HoldingChange(data))
                break
            case Packet.Type.UseBed:
                arr.push(new Server.UseBed(data))
                break
            case Packet.Type.Animation:
                arr.push(new Server.Animation(data))
                break
            case Packet.Type.EntityAction:
                arr.push(new Server.EntityAction(data))
                break
            case Packet.Type.NamedEntitySpawn:
                arr.push(new Server.NamedEntitySpawn(data))
                break
            case Packet.Type.PickupSpawn:
                arr.push(new Server.PickupSpawn(data))
                break
            case Packet.Type.CollectItem:
                arr.push(new Server.CollectItem(data))
                break
            case Packet.Type.AddObjectVehicle:
                arr.push(new Server.AddObjectVehicle(data))
                break
            case Packet.Type.MobSpawn:
                arr.push(new Server.MobSpawn(data))
                break
            case Packet.Type.EntityPainting:
                arr.push(new Server.EntityPainting(data))
                break
            case Packet.Type.StanceUpdate:
                arr.push(new Server.StanceUpdate(data))
                break
            case Packet.Type.EntityVelocity:
                arr.push(new Server.EntityVelocity(data))
                break
            case Packet.Type.DestroyEntity:
                arr.push(new Server.DestroyEntity(data))
                break
            case Packet.Type.Entity:
                arr.push(new Server.Entity(data))
                break
            case Packet.Type.EntityRelativeMove:
                arr.push(new Server.EntityRelativeMove(data))
                break
            case Packet.Type.EntityLook:
                arr.push(new Server.EntityLook(data))
                break
            case Packet.Type.EntityLookAndRelativeMove:
                arr.push(new Server.EntityLookAndRelativeMove(data))
                break
            case Packet.Type.EntityTeleport:
                arr.push(new Server.EntityTeleport(data))
                break
            case Packet.Type.EntityStatus:
                arr.push(new Server.EntityStatus(data))
                break
            case Packet.Type.AttachEntity:
                arr.push(new Server.AttachEntity(data))
                break
            case Packet.Type.EntityMetadata:
                arr.push(new Server.EntityMetadata(data))
                break
            case Packet.Type.PreChunk:
                arr.push(new Server.PreChunk(data))
                break
            case Packet.Type.MapChunk:
                arr.push(new Server.MapChunk(data))
                break
            case Packet.Type.MultiBlockChange:
                arr.push(new Server.MultiBlockChange(data))
                break
            case Packet.Type.BlockChange:
                arr.push(new Server.BlockChange(data))
                break
            case Packet.Type.BlockAction:
                arr.push(new Server.BlockAction(data))
                break
            case Packet.Type.Explosion:
                arr.push(new Server.Explosion(data))
                break
            case Packet.Type.SoundEffect:
                arr.push(new Server.SoundEffect(data))
                break
            case Packet.Type.NewInvalidState:
                arr.push(new Server.NewInvalidState(data))
                break
            case Packet.Type.Thunderbolt:
                arr.push(new Server.Thunderbolt(data))
                break
            case Packet.Type.OpenWindow:
                arr.push(new Server.OpenWindow(data))
                break
            case Packet.Type.CloseWindow:
                arr.push(new Server.CloseWindow(data))
                break
            case Packet.Type.WindowClick:
                arr.push(new Server.WindowClick(data))
                break
            case Packet.Type.SetSlot:
                arr.push(new Server.SetSlot(data))
                break
            case Packet.Type.WindowItems:
                arr.push(new Server.WindowItems(data))
                break
            case Packet.Type.UpdateProgressBar:
                arr.push(new Server.UpdateProgressBar(data))
                break
            case Packet.Type.Transaction:
                arr.push(new Server.Transaction(data))
                break
            case Packet.Type.UpdateSign:
                arr.push(new Server.UpdateSign(data))
                break
            case Packet.Type.ItemData:
                arr.push(new Server.ItemData(data))
                break
            case Packet.Type.IncrementStatistic:
                arr.push(new Server.IncrementStatistic(data))
                break
            case Packet.Type.DisconnectKick:
                arr.push(new Server.DisconnectKick(data))
                break
        }
        return arr
    }
    export class KeepAlive extends Packet
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
    export class LoginRequest extends Packet
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
    export class Handshake extends Packet
    {
        readonly connectionHash: string
        constructor(buffer: OBuffer)
        {
            super(buffer,0x02)
            
            
            this.connectionHash = buffer.readString16()
        }
    }
    export class ChatMessage extends Packet
    {
        readonly message: string
        constructor(buffer: OBuffer)
        {
            super(buffer,0x03)
            this.message = buffer.readString16()
        }
    }
    export class TimeUpdate extends Packet
    {
        readonly time: bigint
        constructor(buffer: OBuffer)
        {
            super(buffer,0x04)
            
            
            this.time = buffer.readLong()
        }
    }
    export class EntityEquipment extends Packet
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
    export class SpawnPosition extends Packet
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
    export class UseEntity extends Packet
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
    export class UpdateHealth extends Packet
    {
        readonly health: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x08)
            
            
            this.health = buffer.readShort()
        }
    }
    export class Respawn extends Packet
    {
        readonly world: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x09)
            
            
            this.world = buffer.readByte()
        }
    }
    export class PlayerPositionAndLook extends Packet
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
    export class PlayerDigging extends Packet
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
    export class PlayerBlockPlacement extends Packet
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
    export class HoldingChange extends Packet
    {
        readonly slotID: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x10)
            this.slotID = buffer.readShort()
        }
    }
    export class UseBed extends Packet
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
    export class Animation extends Packet
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
    export class EntityAction extends Packet
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
    export class NamedEntitySpawn extends Packet
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
    export class PickupSpawn extends Packet
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
    export class CollectItem extends Packet
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
    export class AddObjectVehicle extends Packet
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
    export enum MobSpawnSheepWoolColors
    {
        White,
        Orange,
        Magenta,
        LightBlue,
        Yellow,
        Lime,
        Pink,
        Gray,
        Silver,
        Cyan,
        Purple,
        Blue,
        Brown,
        Green,
        Red,
        Black
    }
    export enum MobSpawnFlags
    {
        OnFire,
        Crouched,
        Riding
    }
    export enum MobSpawnWolfFlags
    {
        SittingDown,
        Agressive,
        Tamed
    }
    export class MobSpawn extends Packet
    {
        readonly entityID: number
        readonly type: MobSpawnType
        readonly x: number
        readonly y: number
        readonly z: number
        readonly yaw: number
        readonly pitch: number
        readonly data: Metadata[]
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
            this.data = Metadata.read(buffer)
        }
    }
    export enum EntityPaintingDirection
    {
        "-Z",
        "-X",
        "+Z",
        "+X"
    }
    export class EntityPainting extends Packet
    {
        readonly entityID: number
        readonly title: string
        readonly x: number
        readonly y: number
        readonly z: number
        readonly direction: EntityPaintingDirection
        constructor(buffer: OBuffer)
        {
            super(buffer,0x19)
            this.entityID = buffer.readInt()
            this.title = buffer.readString16()
            this.x = buffer.readInt()
            this.y = buffer.readInt()
            this.z = buffer.readInt()
            this.direction = buffer.readInt()
        }
    }
    export class StanceUpdate extends Packet
    {
        readonly _float1: number
        readonly _float2: number
        readonly _float3: number
        readonly _float4: number
        readonly _bool1: boolean
        readonly _bool2: boolean
        constructor(buffer: OBuffer)
        {
            super(buffer,0x01b)
            this._float1 = buffer.readFloat()
            this._float2 = buffer.readFloat()
            this._float3 = buffer.readFloat()
            this._float4 = buffer.readFloat()
            this._bool1 = buffer.readBool()
            this._bool2 = buffer.readBool()
        }
    }
    export class EntityVelocity extends Packet
    {
        readonly entityID: number
        readonly velX: number
        readonly velY: number
        readonly velZ: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x1c)
            this.entityID = buffer.readInt()
            this.velX = buffer.readShort()
            this.velY = buffer.readShort()
            this.velZ = buffer.readShort()
        }
    }
    export class DestroyEntity extends Packet
    {
        readonly entityID: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x1d)
            this.entityID = buffer.readInt()
        }
    }
    export class Entity extends Packet
    {
        readonly entityID: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x01e)
            this.entityID = buffer.readInt()
        }
    }
    export class EntityRelativeMove extends Packet
    {
        readonly entityID: number
        readonly dX: number
        readonly dY: number
        readonly dZ: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x1f)
            this.entityID = buffer.readInt()
            this.dX = buffer.readByte()
            this.dY = buffer.readByte()
            this.dZ = buffer.readByte()
        }
    }
    export class EntityLook extends Packet
    {
        readonly entityID: number
        readonly yaw: number
        readonly pitch: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x20)
            this.entityID = buffer.readInt()
            this.yaw = buffer.readByte()
            this.pitch = buffer.readByte()
        }
    }
    export class EntityLookAndRelativeMove extends Packet
    {
        readonly entityID: number
        readonly dX: number
        readonly dY: number
        readonly dZ: number
        readonly yaw: number
        readonly pitch: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x21)
            this.entityID = buffer.readInt()
            this.dX = buffer.readByte()
            this.dY = buffer.readByte()
            this.dZ = buffer.readByte()
            this.yaw = buffer.readByte()
            this.pitch = buffer.readByte()
        }
    }
    export class EntityTeleport extends Packet
    {
        readonly entityID: number
        readonly x: number
        readonly y: number
        readonly z: number
        readonly yaw: number
        readonly pitch: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x22)
            this.entityID = buffer.readInt()
            this.x = buffer.readInt()
            this.y = buffer.readInt()
            this.z = buffer.readInt()
            this.yaw = buffer.readByte()
            this.pitch = buffer.readByte()
        }
    }
    export class EntityStatus extends Packet
    {
        readonly entityID: number
        readonly status: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x26)
            this.entityID = buffer.readInt()
            this.status = buffer.readByte()
        }
    }
    export class AttachEntity extends Packet
    {
        readonly entityID: number
        readonly vehicleID: number
        constructor(buffer: OBuffer)
        {
            super(buffer,0x27)
            this.entityID = buffer.readInt()
            this.vehicleID = buffer.readInt()
        }
    }
    export class EntityMetadata extends Packet
    {
        readonly entityID: number
        readonly data: Metadata[]
        constructor(buffer: OBuffer)
        {
            super(buffer,0x28)
            this.entityID = buffer.readInt()
            this.data = Metadata.read(buffer)
        }
    }
}

export class Metadata
{
    readonly type: Metadata.Type
    readonly bitmask: number
    readonly data: Metadata.Data
    constructor(t: Metadata.Type,b: number,d: Metadata.Data)
    {
        this.type = t
        this.bitmask = b
        this.data = d
    }
}

export namespace Metadata
{
    export enum Type
    {
        Byte,
        Short,
        Int,
        Float,
        String,
        /** byte, short, byte */
        Item,
        /** int, int, int */
        Vector
    }
    export interface Item
    {
        id: number
        count: number
        damage: number
    }
    export interface Vector
    {
        x: number
        y: number
        z: number
    }
    export function read(buffer: OBuffer)
    {
        const arr: Metadata[] = []
        for(var index = buffer.readByte();index != 127;index = buffer.readByte())
        {
            const type: Type = (index & 0xe0) >> 5
            const bitmask = index & 0x1f
            switch(type)
            {
                case Type.Byte:
                    arr.push(new Metadata(type,bitmask,buffer.readByte()))
                    break
                case Type.Short:
                    arr.push(new Metadata(type,bitmask,buffer.readShort()))
                    break
                case Type.Int:
                    arr.push(new Metadata(type,bitmask,buffer.readInt()))
                    break
                case Type.Float:
                    arr.push(new Metadata(type,bitmask,buffer.readString16()))
                    break
                case Type.Item:
                    arr.push(new Metadata(type,bitmask,{
                        id: buffer.readShort(),
                        count: buffer.readByte(),
                        damage: buffer.readShort()
                    }))
                    break
                case Type.Vector:
                    arr.push(new Metadata(type,bitmask,{
                        x: buffer.readInt(),
                        y: buffer.readInt(),
                        z: buffer.readInt()
                    }))
                    break
            }
        }
        return arr
    }
    export type Data = string | number | Metadata.Vector | Metadata.Item
}