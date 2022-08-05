import { TextChannel } from 'discord.js';
import { uuid } from '../Utils/index';
import * as Express from "express";
import Bodyparser from "body-parser";
import { join } from "path";
import { readFileSync } from "fs";
import { prisma, shardingManager } from '../..';

const Route = Express.Router()
// testing

let file =  readFileSync(join(process.cwd(), "../assets/JoinServer.html")).toString()
let validPog : Set<string> = new Set()
let Invitelock : Set<string> = new Set()
Route.get("/:id",async (req: Express.Request, res : Express.Response) => {
    if (Invitelock.has(req.params.id)) {
        res.send("This invite is already being claimed by another user")
        return;
    }
    let inv = await prisma.discordInvite.findFirst({
        where:{
            AND:{
                id:req.params.id,
                Valid:true,
                DiscordUserId:null
            }
        }
    }).catch(_=>undefined)
    if (!inv) {
        res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        return
    }
    Invitelock.add(req.params.id)
    let pog = new uuid().toString();
    validPog.add(pog)

    setTimeout(()=>{
        Invitelock.delete(req.params.id)
        validPog.delete(pog)
    },15e3)

    res.send(file.replaceAll("{_INVITECODE}","ag" + Buffer.from(pog).toString("base64") + "kg"))
})
Route.post("/:id",Express.text(),async (req: Express.Request, res : Express.Response) => {
    let [code,fp] = (req.body.toString() as string).split(".");
    if (!validPog.has(code)) {
        res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        return
    }
    console.log("poggers (post)",code,fp)

    let code2 = await shardingManager.broadcastEval(async c=>{
        let i = await (await c.channels.fetch("1004149509334515864") as TextChannel).createInvite({maxAge:60,unique:true,maxUses:3})

        return i.code
    })

    let response = await prisma.$transaction([
        prisma.registeredData.create({
            data:{
                Hwid:fp,
                // Ip:req.ip,
            },
        }),
        prisma.discordInvite.update({
        where:{
            id:req.params.id
        },
        data:{
            DiscordInviteCode:code2[0],
        }
    })]).catch(_=>undefined)
    if (!response) {
        res.redirect("/invite/failure")
        return
    }
    setTimeout(()=>{
        Invitelock.delete(req.params.id)
        validPog.delete(code)
    },15e3)

    res.send(`https://discord.gg/${code2[0]}`)

})

Route.put("/failure",(req,res)=>{
    res.send("Invitation failed, perhaps you're already registered")
})

Route.put("/*",(req: Express.Request, res : Express.Response) => {
    res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
})

export default Route;