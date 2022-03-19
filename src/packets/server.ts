import { OBuffer } from "../buffer"
import { Packet as _Packet } from "."
import { DataType, Direction } from "../types"
import { Metadata } from "./metadata"
import { inflateSync } from "zlib"
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { resolve } from "path"

export abstract class Packet extends _Packet
{
    readonly raw: OBuffer
    constructor(buffer: OBuffer,id: _Packet.Type)
    {
        super(id)
        this.raw = buffer
        this.checkID(buffer.readByte())
        _Packet.serverside.set(id,typeof this as unknown as typeof _Packet)
    }
    toBuffer()
    {
        return this.raw
    }
    dump()
    {
        const date = new Date()
        const path = resolve(process.cwd(),"dump")
        if(!existsSync(path)) mkdirSync(path)
        writeFileSync(resolve(path,`packet-${this.id.toString(16)}-${date.getDate()}${date.getMonth()}${date.getFullYear()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}.bin`),this.raw.getBuffer())
    }
}

export function parse(data: OBuffer)
{
    const arr: Packet[] = []
    const type = data.readByte() as _Packet.Type
    data.read_offset -= DataType.byte
    switch(type)
    {
        case Packet.Type.KeepAlive:
            arr.push(new KeepAlive(data))
            break
        case Packet.Type.LoginRequest:
            arr.push(new LoginRequest(data))
            break
        case Packet.Type.Handshake:
            arr.push(new Handshake(data))
            break
        case Packet.Type.ChatMessage:
            arr.push(new ChatMessage(data))
            break
        case Packet.Type.TimeUpdate:
            arr.push(new TimeUpdate(data))
            break
        case Packet.Type.EntityEquipment:
            arr.push(new EntityEquipment(data))
            break
        case Packet.Type.SpawnPosition:
            arr.push(new SpawnPosition(data))
            break
        case Packet.Type.UseEntity:
            arr.push(new UseEntity(data))
            break
        case Packet.Type.UpdateHealth:
            arr.push(new UpdateHealth(data))
            break
        case Packet.Type.Respawn:
            arr.push(new Respawn(data))
            break
        case Packet.Type.PlayerPositionAndLook:
            arr.push(new PlayerPositionAndLook(data))
            break
        case Packet.Type.PlayerDigging:
            arr.push(new PlayerDigging(data))
            break
        case Packet.Type.PlayerBlockPlacement:
            arr.push(new PlayerBlockPlacement(data))
            break
        case Packet.Type.HoldingChange:
            arr.push(new HoldingChange(data))
            break
        case Packet.Type.UseBed:
            arr.push(new UseBed(data))
            break
        case Packet.Type.Animation:
            arr.push(new Animation(data))
            break
        case Packet.Type.EntityAction:
            arr.push(new EntityAction(data))
            break
        case Packet.Type.NamedEntitySpawn:
            arr.push(new NamedEntitySpawn(data))
            break
        case Packet.Type.PickupSpawn:
            arr.push(new PickupSpawn(data))
            break
        case Packet.Type.CollectItem:
            arr.push(new CollectItem(data))
            break
        case Packet.Type.AddObjectVehicle:
            arr.push(new AddObjectVehicle(data))
            break
        case Packet.Type.MobSpawn:
            arr.push(new MobSpawn(data))
            break
        case Packet.Type.EntityPainting:
            arr.push(new EntityPainting(data))
            break
        case Packet.Type.StanceUpdate:
            arr.push(new StanceUpdate(data))
            break
        case Packet.Type.EntityVelocity:
            arr.push(new EntityVelocity(data))
            break
        case Packet.Type.DestroyEntity:
            arr.push(new DestroyEntity(data))
            break
        case Packet.Type.Entity:
            arr.push(new Entity(data))
            break
        case Packet.Type.EntityRelativeMove:
            arr.push(new EntityRelativeMove(data))
            break
        case Packet.Type.EntityLook:
            arr.push(new EntityLook(data))
            break
        case Packet.Type.EntityLookAndRelativeMove:
            arr.push(new EntityLookAndRelativeMove(data))
            break
        case Packet.Type.EntityTeleport:
            arr.push(new EntityTeleport(data))
            break
        case Packet.Type.EntityStatus:
            arr.push(new EntityStatus(data))
            break
        case Packet.Type.AttachEntity:
            arr.push(new AttachEntity(data))
            break
        case Packet.Type.EntityMetadata:
            arr.push(new EntityMetadata(data))
            break
        case Packet.Type.PreChunk:
            arr.push(new PreChunk(data))
            break
        case Packet.Type.MapChunk:
            arr.push(new MapChunk(data))
            break
        case Packet.Type.MultiBlockChange:
            arr.push(new MultiBlockChange(data))
            break
        case Packet.Type.BlockChange:
            arr.push(new BlockChange(data))
            break
        case Packet.Type.BlockAction:
            arr.push(new BlockAction(data))
            break
        case Packet.Type.Explosion:
            arr.push(new Explosion(data))
            break
        case Packet.Type.SoundEffect:
            arr.push(new SoundEffect(data))
            break
        case Packet.Type.NewInvalidState:
            arr.push(new NewInvalidState(data))
            break
        case Packet.Type.Thunderbolt:
            arr.push(new Thunderbolt(data))
            break
        case Packet.Type.OpenWindow:
            arr.push(new OpenWindow(data))
            break
        case Packet.Type.CloseWindow:
            arr.push(new CloseWindow(data))
            break
        case Packet.Type.SetSlot:
            arr.push(new SetSlot(data))
            break
        case Packet.Type.WindowItems:
            arr.push(new WindowItems(data))
            break
        case Packet.Type.UpdateProgressBar:
            arr.push(new UpdateProgressBar(data))
            break
        case Packet.Type.Transaction:
            arr.push(new Transaction(data))
            break
        case Packet.Type.UpdateSign:
            arr.push(new UpdateSign(data))
            break
        case Packet.Type.ItemData:
            arr.push(new ItemData(data))
            break
        case Packet.Type.IncrementStatistic:
            arr.push(new IncrementStatistic(data))
            break
        case Packet.Type.DisconnectKick:
            arr.push(new DisconnectKick(data))
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
    readonly username: string
    readonly mapSeed: bigint
    readonly dimension: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x01)
        
        
        this.entityID = buffer.readInt()
        this.username = buffer.readString16()
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
        this.message = buffer.readString16(119)
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
export class PreChunk extends Packet
{
    readonly x: number
    readonly z: number
    readonly mode: boolean
    constructor(buffer: OBuffer)
    {
        super(buffer,0x32)
        this.x = buffer.readInt()
        this.z = buffer.readInt()
        this.mode = buffer.readBool()
    }
}
export class MapChunk extends Packet
{
    readonly x: number
    readonly y: number
    readonly z: number
    readonly size_x: number
    readonly size_y: number
    readonly size_z: number
    readonly c_size: number
    readonly c_data: number[]

    readonly chunkX: number
    readonly chunkY: number
    readonly chunkZ: number

    readonly startX: number
    readonly startY: number
    readonly startZ: number

    readonly c_data_size: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x33)
        this.x = buffer.readInt()
        this.y = buffer.readShort()
        this.z = buffer.readInt()
        this.chunkX = this.x >> 4
        this.chunkY = this.y >> 7
        this.chunkZ = this.z >> 4
        this.startX = this.x & 15
        this.startY = this.y & 127
        this.startZ = this.z & 15
        this.size_x = buffer.readByte()+1
        this.size_y = buffer.readByte()+1
        this.size_z = buffer.readByte()+1
        this.c_size = buffer.readInt()
        var arr = new Array(this.c_size)
        arr = buffer.readFully(arr)
        this.c_data_size = this.size_x*this.size_y*this.size_z*2.5
        this.c_data = [...inflateSync(new Uint8Array(arr))]
    }
}
export class MultiBlockChange extends Packet
{
    readonly chunkX: number
    readonly chunkZ: number
    readonly arr_size: number
    readonly coords_arr: number[]
    readonly type_arr: number[]
    readonly metadata_arr: number[]
    constructor(buffer: OBuffer)
    {
        super(buffer,0x34)
        this.chunkX = buffer.readInt()
        this.chunkZ = buffer.readInt()
        this.arr_size = buffer.readShort()
        this.coords_arr = new Array(this.arr_size)
        this.type_arr = new Array(this.arr_size)
        this.metadata_arr = new Array(this.arr_size)
        for(var index = 0;index < this.arr_size;index++)
            this.coords_arr[index] = buffer.readShort()
        this.type_arr = buffer.readFully(this.type_arr)
        this.metadata_arr = buffer.readFully(this.type_arr)
    }
}
export class BlockChange extends Packet
{
    readonly x: number
    readonly y: number
    readonly z: number
    readonly type: number
    readonly metadata: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x35)
        this.x = buffer.readInt()
        this.y = buffer.readByte()
        this.z = buffer.readInt()
        this.type = buffer.readByte()
        this.metadata = buffer.readByte()
    }
}
export enum BlockActionInstrumentType
{
    Harp,
    DoubleBass,
    SnareDrum,
    ClicksSticks,
    BassDrum
}
export enum BlockActionPistonDirection
{
    Down,
    Up,
    South,
    West,
    North,
    East
}
export class BlockAction extends Packet
{
    readonly x: number
    readonly y: number
    readonly z: number
    readonly type__state: number
    readonly pitch__direction: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x35)
        this.x = buffer.readInt()
        this.y = buffer.readShort()
        this.z = buffer.readInt()
        this.type__state = buffer.readByte()
        this.pitch__direction = buffer.readByte()
    }
}
export class Explosion extends Packet
{
    readonly x: number
    readonly y: number
    readonly z: number
    readonly size: number
    readonly count: number
    readonly records: Metadata.Vector[]
    constructor(buffer: OBuffer)
    {
        super(buffer,0x3c)
        this.x = buffer.readDouble()
        this.y = buffer.readDouble()
        this.z = buffer.readDouble()
        this.size = buffer.readFloat()
        this.count = buffer.readInt()
        this.records = []
        for(var index = 0;index < this.count;index++)
            this.records.push({
                x: buffer.readByte() + this.x,
                y: buffer.readByte() + this.y,
                z: buffer.readByte() + this.z
            })
    }
}
export enum SoundEffectID
{
    CLICK2,
    CLICK1,
    BOW_FIRE,
    DOOR_TOGGLE,
    EXTINGUISH,
    RECORD_PLAY,
    SMOKE,
    BLOCK_BREAK
}
export class SoundEffect extends Packet
{
    readonly effectID: number
    readonly x: number
    readonly y: number
    readonly z: number
    readonly data: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x3d)
        this.effectID = buffer.readInt()
        this.x = buffer.readInt()
        this.y = buffer.readByte()
        this.z = buffer.readInt()
        this.data = buffer.readInt()
    }
}
export enum NewInvalidStateCode
{
    InvalidBed,
    BeginRaining,
    EndRaining
}
export class NewInvalidState extends Packet
{
    readonly reason: NewInvalidStateCode
    constructor(buffer: OBuffer)
    {
        super(buffer,0x46)
        this.reason = buffer.readByte()
    }
}
export class Thunderbolt extends Packet
{
    readonly entityID: number
    readonly _bool1: boolean
    readonly x: number
    readonly y: number
    readonly z: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x47)
        this.entityID = buffer.readInt()
        this._bool1 = buffer.readBool()
        this.x = buffer.readInt()
        this.y = buffer.readInt()
        this.z = buffer.readInt()
    }
}
export class OpenWindow extends Packet
{
    readonly windowID: number
    readonly type: number
    readonly title: string
    readonly slots: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x64)
        this.windowID = buffer.readByte()
        this.type = buffer.readByte()
        this.title = buffer.readString8()
        this.slots = buffer.readByte()
    }
}
export class CloseWindow extends Packet
{
    readonly windowID: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x65)
        this.windowID = buffer.readByte()
    }
}
export class SetSlot extends Packet
{
    readonly windowID: number
    readonly slot: number
    readonly itemID: number
    readonly itemCount: number
    readonly itemUses: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x67)
        this.windowID = buffer.readByte()
        this.slot = buffer.readShort()
        this.itemID = buffer.readShort()
        if(this.itemID != -1)
        {
            this.itemCount = buffer.readByte()
            this.itemUses = buffer.readShort()
        }
    }
}
export class WindowItems extends Packet
{
    readonly windowID: number
    readonly count: number
    readonly payload: WindowItems.Item[]
    constructor(buffer: OBuffer)
    {
        super(buffer,0x68)
        this.windowID = buffer.readByte()
        this.count = buffer.readShort()
        this.payload = new Array(this.count)
        for(var index = 0;index < this.count;index++)
        {
            const itemID = buffer.readShort()
            if(itemID != -1)
            {
                const count = buffer.readByte()
                const uses = buffer.readShort()
                this.payload[index] = {itemID,count,uses}
            }
            else this.payload[index] = {}
        }
    }
}
export namespace WindowItems
{
    export interface Item
    {
        itemID?: number
        count?: number
        uses?: number
    }
}
export class UpdateProgressBar extends Packet
{
    readonly windowID: number
    readonly bar: number
    readonly value: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0x69)
        this.windowID = buffer.readByte()
        this.bar = buffer.readShort()
        this.value = buffer.readShort()
    }
}
export class Transaction extends Packet
{
    readonly windowID: number
    readonly action: number
    readonly accepted: boolean
    constructor(buffer: OBuffer)
    {
        super(buffer,0x6A)
        this.windowID = buffer.readByte()
        this.action = buffer.readShort()
        this.accepted = buffer.readBool()
    }
}
export class UpdateSign extends Packet
{
    readonly x: number
    readonly y: number
    readonly z: number
    readonly text: [string,string,string,string]
    constructor(buffer: OBuffer)
    {
        super(buffer,0x82)
        this.x = buffer.readInt()
        this.y = buffer.readShort()
        this.z = buffer.readInt()
        this.text = [buffer.readString16(),buffer.readString16(),buffer.readString16(),buffer.readString16()]
    }
}
export class ItemData extends Packet
{
    readonly type: number
    readonly itemID: number
    readonly text_length: number
    readonly text: number[]
    constructor(buffer: OBuffer)
    {
        super(buffer,0x83)
        this.type = buffer.readShort()
        this.itemID = buffer.readShort()
        this.text_length = buffer.readByte()
        this.text = new Array(this.text_length & 0xff)
        this.text = buffer.readFully(this.text)
    }
}
export class IncrementStatistic extends Packet
{
    readonly statisticID: number
    readonly amount: number
    constructor(buffer: OBuffer)
    {
        super(buffer,0xc8)
        this.statisticID = buffer.readInt()
        this.amount = buffer.readByte()
    }
}
export class DisconnectKick extends Packet
{
    readonly reason: string
    constructor(buffer: OBuffer)
    {
        super(buffer,0xff)
        this.reason = buffer.readString16()
    }
}