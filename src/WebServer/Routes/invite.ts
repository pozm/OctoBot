import { uuid } from '../Utils/index';
import * as Express from "express";
import Bodyparser from "body-parser";
import { join } from "path";
import { readFileSync } from "fs";
import { prisma } from '../..';

const Route = Express.Router()
// testing

let file =  readFileSync(join(process.cwd(), "../assets/JoinServer.html")).toString()
let validPog = new Map<string,string>();
Route.get("/:id",async (req: Express.Request, res : Express.Response) => {
    let inv = await prisma.discordInvite.findFirst({
        where:{
            AND:{
                id:req.params.id,
                Valid:true
            }
        }
    }).catch(_=>undefined)
    if (!inv) {
        res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        return
    }
    let pog = new uuid().toString();
    validPog.set(pog,inv.DiscordInviteCode)
    res.send(file.replaceAll("{_INVITECODE}","ag" + Buffer.from(pog).toString("base64") + "kg"))
})
Route.post("/:id",Express.text(),(req: Express.Request, res : Express.Response) => {
    let [code,fp] = (req.body.toString() as string).split(".");
    if (!validPog.has(code)) {
        res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        return
    }
    console.log("poggers (post)",code,fp)
    res.send(`https://discord.gg/${validPog.get(code)}`)
})
Route.put("/*",(req: Express.Request, res : Express.Response) => {
    res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
})

export default Route;