import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, GuildMember, ModalBuilder } from 'discord.js';
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
        let UserData = await prisma.discordUser.findFirst({
            where:{
                id:command.user.id
            },
            include:{
                DiscordInvites:true
            }
        })
        if (!UserData) {
            return console.log("h?")
        }

        let okay = new ButtonBuilder()
        .setLabel("Okay")
        .setStyle(ButtonStyle.Success)
        .setCustomId("invite-modal-okay")

        let cancel = new ButtonBuilder()
        .setLabel("Nevermind")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("invite-modal-no")

        let buttonsRow = new ActionRowBuilder().addComponents(okay,cancel);

        
        if (UserData.DiscordInvites.length > 0) {
            let anInvite = UserData.DiscordInvites[0]
            if (UserData.MaxInvites <= UserData.DiscordInvites.length) {
                command.reply({ephemeral:true,content:"You have reached the maximum amount of invites you can generate."})
                return
            }
        }

        let m = await command.reply({
            ephemeral:true,
            components:[buttonsRow as any],
            content:`Are you sure you want to create an invite? You will have ${UserData.MaxInvites - UserData.DiscordInvites.length} remaining.`
        }).catch(e=>(console.log(e),undefined))
        if (!m) return console.log("no msg");

        let components = await m.awaitMessageComponent({
            filter:i=>i.customId.includes("invite"),
            time:60e3,
        })

        if (components.customId.includes("no")) {
            command.editReply({
                content:"Invite creation cancelled.",
                components:[]
            })
        } else {
            let entry = await prisma.discordInvite.create({
                data:{
                    GeneratedBy:{
                        connect:{
                            id:command.user.id
                        }
                    },
                    DiscordInviteCode:"00"
                }
            })
            let domain = ifDev(`http://localhost:42547/api`,`https://octo.aixeria.com`)
            command.editReply({content:`Your invite is at ${domain}/invite/${entry.id}`,components:[]})

        }

    }

}