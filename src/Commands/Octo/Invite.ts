import { GuildMember } from 'discord.js';
import { EventsSet } from './../../bot';
import { CommandsSet } from '../../bot';
import { SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';
import { CommandInteraction, CacheType, ChannelType, TextChannel } from 'discord.js';
import { FetchCommandByNameOrAlias, ifDev } from '../../Utils/Methods';
import { CommandClass } from '../../Utils/CommandClass';
import { createCanvas } from '@napi-rs/canvas';
import {DateFns, Versioning} from 'native-utils-octo'
import { prisma } from '../..';
export default class InviteCommand extends CommandClass {
    private RespectedUser = "1003414637183762494"
    constructor() {
        super('invite', 'Generate an invite', []);
    }
    
    override async invoke(command: CommandInteraction<CacheType>) {
        if (!(command.member as GuildMember).roles.cache.has(this.RespectedUser)) {
            command.reply({ephemeral:true,content:"You do not have permission to use this command. (you must be respected)"})
            return
        }
        let InviteUserData = await prisma.discordInvite.findMany({
            where:{
                GeneratedById:command.user.id
            },
            include:{
                GeneratedBy:true
            }
        })
        if (InviteUserData.length > 0) {
            let invite = InviteUserData[0]
            if (invite.GeneratedBy.MaxInvites <= InviteUserData.length) {
                command.reply({ephemeral:true,content:"You have reached the maximum amount of invites you can generate."})
                return
            }
        }
        (command.guild?.channels.cache.get("1004149509334515864") as TextChannel)!.createInvite({maxAge:0,maxUses:3,unique:true}).then(async invite=>{
            let entry = await prisma.discordInvite.create({
                data:{
                    GeneratedBy:{
                        connect:{
                            id:command.user.id
                        }
                    },
                    DiscordInviteCode:invite.code
                }
            })
            let domain = ifDev(`http://localhost:42547/api`,`https://octo.aixeria.com`)
            command.reply({content:`Your invite is at ${domain}/invite/${entry.id}`,ephemeral:true})
        })


    }

}