import { Client, Message } from "discord.js";
import { RegisterAll } from "../Utils/CommandsRegistrar";
import { HandledDiscordEvent } from "../Utils/Events/DiscordEvent";

export const ReadyEvent = class UponReadyEvent extends HandledDiscordEvent {
    constructor() {
        super("ready",1);
    }
    protected HandledName: string = "Startup"

    protected override OnEventFire(client:Client) {
        console.log(`bot is now ready. logged in as ${client?.user?.tag}`);

        RegisterAll();

        console.log("registered slash commands")
    }
}