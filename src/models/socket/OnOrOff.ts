enum EventType{
    OFF,ON,TRANSMISSION
}
interface OnOrOff{
    event:string
    onOrOff:string
}

interface SocketMessagePlayLoad{
    event:string,
    data: any
}