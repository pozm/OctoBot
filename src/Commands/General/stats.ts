import { EventsSet } from './../../bot';
import { CommandsSet } from '../../bot';
import { SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { CommandInteraction, CacheType, EmbedBuilder } from 'discord.js';
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
        let emb = new EmbedBuilder()
        .setAuthor({name:"Octo",iconURL:command.client.user?.displayAvatarURL({size:64})?.toString()})
        .setTitle("Statistics")
        .addFields({name:"Uptime",value:DateFns.prettyFromMs(command.client.uptime!),inline:true}, 
{name:"Commands",value:`${CommandsSet.size} loaded`,inline:true},
{name:"Events",value:`${EventsSet.size} loaded`,inline:true},
{name:"Ping", value:`${Math.round(command.client.ws.ping)}ms`,inline:true},
{name:"Versioning:Commit Hash",value:Versioning.getGitHash().slice(0,8),inline:true},
{name:"Versioning:Branch",value:Versioning.getGitBranch(),inline:true},
{name:"Rust Build Info",value:Versioning.getRustInfo()}
        )
        .setColor("#b884d8")
        command.reply({
            ephemeral:true,
            embeds:[emb]
        })
    }

}