import {Client, ClientEvents} from "discord.js";
import {randomBytes} from "crypto";
import {client, EventReg} from "../../bot";
import {PathLike} from "fs";
interface CONSTRUCTOR_DiscordEvent {
    Event: keyof ClientEvents
    OnEvent: (client: Client, ...h: any[]) => void
}

export class DiscordEvent {
    readonly ID: string;
    protected _Event: keyof ClientEvents
    protected IsRegistered: boolean
    protected OnEvent: (client: Client, ...h: any[]) => void
    protected CurrentHook?: Function
    protected RegisteredId?: string
    // readonly FileName : string;

    constructor(data: CONSTRUCTOR_DiscordEvent) {

        this.ID = randomBytes(32).toString('hex')
        this._Event = data.Event
        this.IsRegistered = false
        this.OnEvent = data.OnEvent


        // this.FileName = __filename.slice(__filename.lastIndexOf(path.sep)+1,__filename.lastIndexOf('.'))
    }

    get fn() {
        return this.OnEvent.bind(this, client);
    }
    get Event() {
        return this._Event;
    }
    public UnRegister() {
        if (this.CurrentHook)
            (this.IsRegistered = false, EventReg.Remove(this._Event ?? 'ready', this.RegisteredId ?? ""))
    }

}

export class HandledDiscordEvent extends DiscordEvent {
    readonly Priority : number;
    protected HandledName : string = "";
    constructor(event: keyof ClientEvents,priority?:number)
    constructor(data: CONSTRUCTOR_DiscordEvent,priority?:number)
    constructor(data: keyof ClientEvents | CONSTRUCTOR_DiscordEvent, priority?:number) {
        if (typeof data == "string") {
            super({
                Event:data,
                OnEvent:()=>{}
            })
            this.OnEvent = this.OnEventFire.bind(this);
        }else
            super(data);
        this.Priority = priority ?? 111
    }
    protected OnEventFire(client:Client,...eventArgs:any[]) {};
    get CustomName() {
        return this.HandledName == "" ? `${this._Event}<${this,this.Priority}>` : this.HandledName
    }
    set CustomName(newv:string) {
        this.HandledName = newv
    }
    public Register() {
        this.CurrentHook = this.OnEvent.bind(this, client)
        this.IsRegistered = true
        this.RegisteredId = EventReg.Register(this._Event, this,this.Priority)
    }

    public _PreventExecutionFlow : boolean = false;
    public _SkipToPriority = -1;
    public _SkipToId = ""

    protected PreventExecution() {
        this._PreventExecutionFlow = true;
    }
    protected set SkipTo(x:string | number) {
        if (typeof x == "string") this._SkipToId = x; else this._SkipToPriority = x;
        // (typeof x == "string" ? this._SkipToId : this._SkipToPriority) = x;
    }
}
