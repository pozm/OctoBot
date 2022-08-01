import chalk from 'chalk';
import {Client, ClientEvents} from 'discord.js'
import { Logger } from '../Logging';
import { uuidv4 } from '../Methods';
import {HandledDiscordEvent} from "./DiscordEvent";

type fnReg = (...args : any[]) => boolean

interface eventMapVal {
    Priority :number
    ev : HandledDiscordEvent
    RegId : string

}
const AsyncFunction = (async () => {}).constructor;
export class EventRegister {
    Client : Client
    EventMap = new Map<keyof ClientEvents, eventMapVal[]>()
    Register(event: keyof ClientEvents,ev: HandledDiscordEvent,Priority?:number) {
        let exists = this.EventMap.get(event)

        if (!exists) {
            this.Client.on(event,this.EventDispatcher.bind(this,event))
        }

        let id = uuidv4()
        this.EventMap.set(event,[...(exists ?? []), {
            ev,
            RegId:id,
            Priority: Priority ?? 1000
        }])

        return id;
    }
    Remove(event : keyof ClientEvents,id :string) {
        this.EventMap.set(event,[...[...this.EventMap.get(event) ?? []].filter(v=>v.RegId!=id)])
    }
    async EventDispatcher(eventName: keyof ClientEvents, ...rest:any[]) {
        let skipToId = ""
        let skipToPriority = -1
        for (let event of this.EventMap.get(eventName)!.sort((a,b)=>a.Priority-b.Priority)) {
            if (skipToId != "" && event.RegId != skipToId) continue;
            else if (skipToPriority >= 0 && event.Priority != skipToPriority) continue;
            event.ev._PreventExecutionFlow = false;
            event.ev._SkipToId = "";
            event.ev._SkipToPriority = -1;
            await event.ev.fn(...rest)
            skipToId = event.ev._SkipToId
            skipToPriority = event.ev._SkipToPriority
            if (event.ev._PreventExecutionFlow) break;
        }
    }
    GetFromName(name:string,filter? : keyof ClientEvents) {
        return [...this.EventMap.values()].find(v=>v.find(h=>h.ev.CustomName == name && filter ? h.ev.Event == filter : true ))
    }
    Update(RegId : string) {
        let g = [...this.EventMap.values()].find(v=>v.find(h=>h.RegId == RegId))
        console.log(g)
    }
    constructor(client:Client) {
        this.Client = client;
    }
}
