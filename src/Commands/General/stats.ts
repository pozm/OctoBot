import { EventsSet } from './../../bot';
import { CommandsSet } from '../../bot';
import { SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { CommandInteraction, CacheType, MessageEmbed } from 'discord.js';
import { FetchCommandByNameOrAlias } from '../../Utils/Methods';
import { CommandClass } from '../../Utils/CommandClass';
import { createCanvas } from '@napi-rs/canvas';
import {DateFns, Versioning} from 'native-utils-octo'
export default class StatsCommand extends CommandClass {
    
    constructor() {
        super('stats', 'display statistics for the bot instance.', [
        ]);
    }
    
    override async invoke(command: CommandInteraction<CacheType>) {
        let emb = new MessageEmbed()
        .setAuthor({name:"Octo",iconURL:command.client.user?.displayAvatarURL({dynamic:true,size:64})?.toString()})
        .setTitle("Statistics")
        .addField("Uptime",DateFns.prettyFromMs(command.client.uptime!),true)
        .addField("Commands",`${CommandsSet.size} loaded`,true)
        .addField("Events",`${EventsSet.size} loaded`,true)
        .addField("Ping", `${Math.round(command.client.ws.ping)}ms`,true)
        .addField("Versioning:Commit Hash",Versioning.getGitHash().slice(0,8),true)
        .addField("Versioning:Branch",Versioning.getGitBranch(),true)
        .addField("Rust Build Info",Versioning.getRustInfo())
        .setColor("#b884d8")
        command.reply({
            ephemeral:true,
            embeds:[emb]
        })
    }

}