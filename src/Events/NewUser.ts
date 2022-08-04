import { Client, GuildMember, Message, TextChannel } from "discord.js";
import { prisma } from "..";
import { RegisterAll } from "../Utils/CommandsRegistrar";
import { HandledDiscordEvent } from "../Utils/Events/DiscordEvent";

export const NewUserEvent = class UponGuildUserAddEvent extends HandledDiscordEvent {
    private UserRole = "1003414549808025633"
    constructor() {
        super("guildMemberAdd",1);
    }
    protected HandledName: string = "NewUser"

    protected override async OnEventFire(client:Client, member : GuildMember) {
        let newUsersChannel = member.guild.channels.cache.get("1004149509334515864") as TextChannel
        let invites = await newUsersChannel.fetchInvites(true)
        console.log("new user!")
        
        let invite = invites.find(i=>i.uses == 1)
        if (!invite) {
            member.kick()
            return
        }
        let discordInvite = await prisma.discordInvite.findFirst({
            where:{
                DiscordInviteCode: invite?.code
            },
            include:{
                GeneratedBy:true,
                DiscordUser:true
            }
        }).catch(_=>undefined)
        if (!discordInvite) {
            await prisma.discordInvite.deleteMany({where:{DiscordInviteCode:invite.code}}).catch(_=>undefined)
            member.kick("p1")
            invite.delete()
            return
        }
        else if (discordInvite.DiscordUserId) {
            await prisma.discordInvite.deleteMany({where:{DiscordInviteCode:invite.code}}).catch(_=>undefined)
            member.kick("p2")
            invite.delete()
            return
        }
        else if (!discordInvite.Valid) {
            await prisma.discordInvite.deleteMany({where:{DiscordInviteCode:invite.code}}).catch(_=>undefined)
            member.kick("p3")
            invite.delete()
            return
        } else {
            // ok i guess?
            await prisma.discordUser.upsert({
                create:{
                    InvitedBy:{connect:{id:discordInvite.GeneratedById}},
                    id:member.id,
                    JoinedInvite:{connect:{id:discordInvite.id}},
                },
                update:{
                    InvitedBy:{connect:{id:discordInvite.GeneratedById}},
                    JoinedInvite:{connect:{id:discordInvite.id}},
                },
                where:{
                    id:member.id
                }
            })
            member.roles.add(this.UserRole)
            let inviter = await client.users?.fetch(discordInvite?.GeneratedById).then(v=>v.username,_=>`unknown<${discordInvite?.GeneratedById}>`)
            newUsersChannel.send({content:`${member.user.username} (${member.user.id}) has joined the server! (Invited by ${inviter})`})
            invite.delete()
        }
    }
}