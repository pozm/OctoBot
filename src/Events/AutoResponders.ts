import { Client, Message, EmbedBuilder } from "discord.js";
import { RegisterAll } from "../Utils/CommandsRegistrar";
import { HandledDiscordEvent } from "../Utils/Events/DiscordEvent";

export const AutoRespondHandler_ = class AutoRespondHandler extends HandledDiscordEvent {
	private Responds = new Map<RegExp,string>()
	constructor() {
        super("messageCreate", 21);
        this.Responds.set(/(how|where|get).{0,24}?(download|game|release|install)/gmi,"please view <#757935290055786517> to find the vulnus download link");
        this.Responds.set(/(how|where|get|download).{0,24}?maps?/gmi,"please view <#966094481466216489> to find maps, all the sound space maps are in pinned.");
        this.Responds.set(/(how|where|get|download).{0,24}?mods?/gmi,"you can get mods from the channel <#966808355404382288>. a guide for setting them up can be found [here](<https://astolfo.uk/git/luna/Vulnus/wiki/Help>)");
	}
    protected HandledName: string = "AutoRespondHandler";
    
	protected override async OnEventFire(client: Client, msg: Message) {

        for (let [reg,resp] of this.Responds) {
            if (reg.test(msg.content)) {
                let emb = new EmbedBuilder();
                emb.setTitle("Vulnus Help")
                emb.setAuthor({name:msg.author.username,iconURL:client.user!.avatarURL()?.toString()});
                emb.setDescription(resp);
                await msg.reply({embeds:[emb]}).then(_=>{
                    // msg.delete().catch(console.warn)
                    this.PreventExecution();
                },console.warn)
                
                return
            }
        }
    }
};
