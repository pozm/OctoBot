import { Client, Interaction, Message } from "discord.js";
import { RegisterAll } from "../Utils/CommandsRegistrar";
import { HandledDiscordEvent } from "../Utils/Events/DiscordEvent";
import { FetchCommandByNameOrAlias, ifDev } from "../Utils/Methods";

export const InteractionCreated = class UponInteractionCreated extends HandledDiscordEvent {
    constructor() {
        super("interactionCreate",1);
    }
    protected HandledName: string = "CommandHandler"
    protected override OnEventFire(client:Client,interaction : Interaction) {
        if (interaction.isCommand()) {

            let fetched = FetchCommandByNameOrAlias(ifDev(interaction.commandName.slice(0,-2),interaction.commandName))
            if (fetched) {
                fetched.Instance?.invoke(interaction)
                console.log(`${fetched.Instance!.name} was invoked by ${interaction.member?.user.username}`)
            }
        }
    }
}

