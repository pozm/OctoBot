import { CommandsSet } from './../../bot';
import { SlashCommandStringOption } from '@discordjs/builders';
import { CommandInteraction, CacheType, MessageEmbed } from 'discord.js';
import { FetchCommandByNameOrAlias } from '../../Utils/Methods';
import { CommandClass } from './../../Utils/CommandClass';
export default class HelpCommand extends CommandClass {
    
    constructor() {
        super('help', 'Displays help for a command', [
        ]);
    }

    override AddOptions(Commands: CommandClass[]) {
        this.options = [...this.options,
            new SlashCommandStringOption().setName('command').setDescription('The command to get help for.').setRequired(false)
                .setChoices(...Commands.map(c => ({name:c.name,value:c.name}))),
        ]
    }
    
    override async invoke(command: CommandInteraction<CacheType>) {
        let commandName = command.options.getString('command');
        let commandModule = FetchCommandByNameOrAlias(commandName ?? "")
        // console.log("not pogger!2!!")
        let userInvokedBy = await command.client.users.fetch(command.member?.user.id ?? "").catch(() => null)
        if (!userInvokedBy) return;
        let helpEmbed = new MessageEmbed()
        .setAuthor({name:"vulnus",iconURL:command.client.user?.displayAvatarURL({dynamic:true,size:64})?.toString()})
        .setFooter({iconURL:userInvokedBy.displayAvatarURL({dynamic:true,size:64}),text:`invoked by ${userInvokedBy.username}`})
        if (commandName && commandModule) {
            helpEmbed
            .setTitle(`Help — ${commandName}`)
            .setColor("#00fff0")
            .setTimestamp(new Date())
            .setDescription(`**${commandModule.Instance?.description || "Description not found"}**`);
            command.reply({
                embeds:[helpEmbed],
                ephemeral:true
            })
        } else if (!commandModule && commandName) {
            command.reply({ephemeral:true,content:"unable to find that command"});
        } else {
            let obj : {[x:string]:string[]} = {}
            for (let v of CommandsSet.values() ?? []) {
                if (v.SortingFolder == "Dev") continue;
                obj[v.SortingFolder] = [...obj[v.SortingFolder] ?? [],'• '+v.Instance?.name ?? "unknown"]
            }
            helpEmbed
            .setTitle(`Help — Command List`)
            .setColor("#f25fa0")
            .setTimestamp(new Date())
            .setDescription("pog!")
            .addFields(Object.entries(obj).map(([i,v],ind)=>({name:i,value:v.join('\n'),inline:ind%4!=3})))
            command.reply({
                embeds:[helpEmbed],
                ephemeral:true
            })
        }
    }

}