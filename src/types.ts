export const MAX_STRING_LENGTH = 16
export const VERSION = 14 // Minecraft Beta 1.7.4, 2011-6-30

export enum DataType
{
    byte = 1,
    short = 2,
    int = 4,
    long = 8,
    float = 4,
    double = 8,
    string = 240,
    bool = 1
}

export enum HandShakeType
{
    NoAuth = "0200002d",
    WithAuth = "0200002b",
    Hash = ""
}

export enum Direction
{
    "-Y",
    "+Y",
    "-Z",
    "+Z",
    "-X",
    "+X"
}