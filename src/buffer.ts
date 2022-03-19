import { DataType } from "./types"
import { MUtf8Decoder, MUtf8Encoder } from "mutf-8"

export class OBuffer
{
    protected buf: Buffer
    read_offset: number = 0
    write_offset: number = 0
    protected __read_and_delete: boolean = false
    constructor(size: number)
    constructor(buf: Buffer)
    constructor(a: number | Buffer)
    {
        if(typeof a == "number") this.buf = Buffer.alloc(a)
        if(a instanceof Buffer) this.buf = a
    }
    setReadAndDelete(state: boolean = !this.__read_and_delete)
    {
        this.__read_and_delete = state
        return this
    }
    getBuffer()
    {
        return this.buf
    }
    writeByte(byte: number)
    {
        this.buf.writeInt8(byte,this.write_offset)
        this.write_offset += DataType.byte
        return this
    }
    readByte()
    {
        const value = this.buf.readInt8(this.read_offset)
        this.read_offset += DataType.byte
        //if(this.__read_and_delete) this.buf = this.buf.slice(this.read_offset)
        return value
    }
    writeShort(short: number)
    {
        this.buf.writeInt16BE(short,this.write_offset)
        this.write_offset += DataType.short
        return this
    }
    readShort()
    {
        const value = this.buf.readInt16BE(this.read_offset)
        this.read_offset += DataType.short
        //if(this.__read_and_delete) this.buf = this.buf.slice(this.read_offset)
        return value
    }
    writeInt(int: number)
    {
        this.buf.writeInt32BE(int,this.write_offset)
        this.write_offset += DataType.int
        return this
    }
    readInt()
    {
        const value = this.buf.readInt32BE(this.read_offset)
        this.read_offset += DataType.int
        //if(this.__read_and_delete) this.buf = this.buf.slice(this.read_offset)
        return value
    }
    writeLong(long: bigint)
    {
        this.buf.writeBigInt64BE(long,this.write_offset)
        this.write_offset += DataType.long
        return this
    }
    readLong()
    {
        const value = this.buf.readBigInt64BE(this.read_offset)
        this.read_offset += DataType.long
        //if(this.__read_and_delete) this.buf = this.buf.slice(this.read_offset)
        return value
    }
    writeFloat(float: number)
    {
        this.buf.writeFloatBE(float,this.write_offset)
        this.write_offset += DataType.float
        return this
    }
    readFloat()
    {
        const value = this.buf.readFloatBE(this.read_offset)
        this.read_offset += DataType.float
        //if(this.__read_and_delete) this.buf = this.buf.slice(this.read_offset)
        return value
    }
    writeDouble(double: number)
    {
        this.buf.writeDoubleBE(double,this.write_offset)
        this.write_offset += DataType.double
        return this
    }
    readDouble()
    {
        const value = this.buf.readDoubleBE(this.read_offset)
        this.read_offset += DataType.double
        //if(this.__read_and_delete) this.buf = this.buf.slice(this.read_offset)
        return value
    }
    writeString16(str: string)
    {
        this.writeShort(str.length)
        for(const char of str) this.writeShort(char.charCodeAt(0))
        return this
    }
    readString16()
    {
        const size = this.readShort()
        const chars: number[] = []
        for(var i = 0;i < size;i++)
        {
            chars.push(this.readShort())
        }
        return String.fromCharCode(...chars)
    }
    writeString8(str: string)
    {
        const encoder = new MUtf8Encoder()
        const code = encoder.encode(str)
        this.buf = Buffer.concat([this.buf,code])
        return this
    }
    readString8()
    {
        const decoder = new MUtf8Decoder("mutf-8")
        const length = this.readShort()
        const buffer = this.buf.slice(this.read_offset,length)
        return decoder.decode(buffer)
    }
    writeBool(bool: boolean)
    {
        return this.writeByte(bool ? 0x01 : 0x00)
    }
    readBool()
    {
        return this.readByte() == 0x01
    }
    write(arr: number[])
    {
        for(const num of arr) this.writeByte(num)
        return this
    }
    readFully(output: number[])
    {
        for(var index = 0;index < output.length;index++)
        {
            output[index] = this.readByte()
        }
        return output
    }
    skipRead(offset: DataType)
    {
        this.read_offset += offset
    }
    skipWrite(offset: DataType)
    {
        this.write_offset += offset
    }
}