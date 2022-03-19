import { writeFileSync } from "fs";
import { resolve } from "path";
import { OBuffer } from "../buffer";

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
    static serverside: Map<Packet.Type,typeof Packet> = new Map()
    static clientside: Map<Packet.Type,typeof Packet> = new Map()
}

export namespace Packet
{
    export function writeJSON(...packets: Packet[])
    {
        const filter = packets.sort(function(a,b){return a.id - b.id})
        const json = JSON.stringify(filter,(key,value) => typeof value == "bigint" ? value.toString() : value)
        const date = new Date()
        const file = resolve(process.cwd(),"packets",`packet-${date.getTime()}.json`)
        
        writeFileSync(file,json,{encoding:"utf-8",flag:"wx"})
    }
    export function getTypeName(type: Type)
    {
        return Type[type]
    }
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
    export type TypeString = keyof typeof Type
    export type PacketEvents = {
        [key in TypeString]: (packet: Packet) => void;
    };
}