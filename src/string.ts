export function string2buffer(str: string)
{
    const buffer = 2
}

export function read(buf: Buffer,offset: number = 0)
{
    const size = buf.readInt8(offset);offset += 2
    for(var i = 0;i < size;i++)
    {
        
    }
}