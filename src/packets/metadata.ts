import { OBuffer } from "../buffer"

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