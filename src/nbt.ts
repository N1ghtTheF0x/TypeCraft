import { OBuffer } from "./buffer"

export enum NBTType
{
    End,
    Byte,
    Short,
    Int,
    Long,
    Float,
    Double,
    ByteArray,
    String,
    List,
    Compound
}

export abstract class NBTTag<Data = any>
{
    readonly type: NBTType
    data: Data
    key: string = ""
    abstract read(buffer: OBuffer): void
    abstract write(buffer: OBuffer): void
    constructor(type: NBTType,data: Data = null)
    {
        this.type = type
        this.data = data
    }
    toJSON(): NBTTag.JSON<Data>
    {
        return {
            type: this.type,
            data: this.data,
            key: this.key
        }
    }
    static create(type: NBTType): NBTTag
    {
        switch(type)
        {
            default:
                return new NBTTagUnknown()
            case NBTType.End:
                return new NBTTag.End()
            case NBTType.Byte:
                return new NBTTag.Byte()
            case NBTType.Short:
                return new NBTTag.Short()
            case NBTType.Int:
                return new NBTTag.Int()
            case NBTType.Long:
                return new NBTTag.Long()
            case NBTType.Float:
                return new NBTTag.Float()
            case NBTType.Double:
                return new NBTTag.Double()
            case NBTType.ByteArray:
                return new NBTTag.ByteArray()
            case NBTType.String:
                return new NBTTag.String()
            case NBTType.List:
                return new NBTTag.List()
            case NBTType.Compound:
                return new NBTTag.Compound()
        }
    }
    static write(nbt: NBTTag,buffer: OBuffer)
    {
        buffer.writeByte(nbt.type)
        if(nbt.type == NBTType.End) return
        buffer.writeString16(nbt.key)
        nbt.write(buffer)
    }
}

class NBTTagUnknown extends NBTTag<unknown>
{
    constructor()
    {
        super(-1)
    }
    read(buffer: OBuffer): void {
        
    }
    write(buffer: OBuffer): void {
        
    }
}

export function readTag(buffer: OBuffer)
{
    const type = buffer.readByte() as NBTType
    if(type == NBTType.End) return new NBTTag.End()
    else
    {
        const tag: NBTTag = NBTTag.create(type)
        tag.key = buffer.readString16()
        tag.read(buffer)
        return tag
    }
}

export namespace NBTTag
{
    export interface JSON<Data>
    {
        data: Data
        key: string
        type: NBTType
    }
    export class End extends NBTTag<null>
    {
        constructor()
        {
            super(NBTType.End)
        }
        read(buffer: OBuffer): void {
        }
        write(buffer: OBuffer): void {
        }
    }
    export class Byte extends NBTTag<number>
    {
        constructor(byte?: number)
        {
            super(NBTType.Byte,byte)
        }
        write(buffer: OBuffer): void {
            buffer.writeByte(this.data)
        }
        read(buffer: OBuffer): void {
            this.data = buffer.readByte()
        }
    }
    export class Short extends NBTTag<number>
    {
        constructor(short?: number)
        {
            super(NBTType.Short,short)
        }
        write(buffer: OBuffer): void {
            buffer.writeShort(this.data)
        }
        read(buffer: OBuffer): void {
            this.data = buffer.readShort()
        }
    }
    export class Int extends NBTTag<number>
    {
        constructor(int?: number)
        {
            super(NBTType.Int,int)
        }
        write(buffer: OBuffer): void {
            buffer.writeInt(this.data)
        }
        read(buffer: OBuffer): void {
            this.data = buffer.readInt()
        }
    }
    export class Long extends NBTTag<bigint>
    {
        constructor(long?: bigint)
        {
            super(NBTType.Long,long)
        }
        write(buffer: OBuffer): void {
            buffer.writeLong(this.data)
        }
        read(buffer: OBuffer): void {
            this.data = buffer.readLong()
        }
    }
    export class Float extends NBTTag<number>
    {
        constructor(float?: number)
        {
            super(NBTType.Float,float)
        }
        write(buffer: OBuffer): void {
            buffer.writeFloat(this.data)
        }
        read(buffer: OBuffer): void {
            this.data = buffer.readFloat()
        }
    }
    export class Double extends NBTTag<number>
    {
        constructor(double?: number)
        {
            super(NBTType.Double,double)
        }
        write(buffer: OBuffer): void {
            buffer.writeDouble(this.data)
        }
        read(buffer: OBuffer): void {
            this.data = buffer.readDouble()
        }
    }
    export class ByteArray extends NBTTag<number[]>
    {
        constructor(bytea?: number[])
        {
            super(NBTType.ByteArray,bytea)
        }
        write(buffer: OBuffer): void {
            buffer.writeInt(this.data.length)
            buffer.write(this.data)
        }
        read(buffer: OBuffer): void {
            const size = buffer.readInt()
            this.data = new Array(size)
            this.data = buffer.readFully(this.data)
        }
    }
    export class String extends NBTTag<string>
    {
        constructor(string?: string)
        {
            super(NBTType.String,string)
        }
        write(buffer: OBuffer): void {
            buffer.writeString16(this.data)
        }
        read(buffer: OBuffer): void {
            this.data = buffer.readString16()
        }
    }
    export class List extends NBTTag<NBTTag[]>
    {
        tagType: NBTType
        constructor(list?: NBTTag[])
        {
            super(NBTType.List,list)
        }
        write(buffer: OBuffer): void {
            if(this.data.length > 0) this.tagType = this.data[0].type
            else this.tagType = 1
            buffer.writeByte(this.tagType)
            buffer.writeInt(this.data.length)
            for(const tag of this.data) tag.write(buffer)
        }
        read(buffer: OBuffer): void {
            this.tagType = buffer.readByte() as NBTType
            const size = buffer.readInt()
            this.data = new Array(size)
            for(var index = 0;index < size;index++)
            {
                const tag = NBTTag.create(this.tagType)
                tag.read(buffer)
                this.data[index] = tag
            }
        }
    }
    export class Compound extends NBTTag<Map<string,NBTTag>>
    {
        constructor(map?: Map<string,NBTTag>)
        {
            super(NBTType.Compound,map)
        }
        write(buffer: OBuffer): void {
            for(const nbt of this.data.values()) NBTTag.write(nbt,buffer)
        }
        read(buffer: OBuffer): void {
            this.data.clear()
            var nbt: NBTTag
            for(;(nbt = readTag(buffer)).type != NBTType.End;this.data.set(nbt.key,nbt)){}
        }
    }
}