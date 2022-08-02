import { ShardingManager } from 'discord.js';
import path from 'path';
import { startServer } from './WebServer/';
import {config} from 'dotenv'
import { Logger } from './Utils/Logging';
import chalk from 'chalk';
import { PrismaClient } from '@prisma/client';


config()

process.chdir(__dirname);
console.log(process.env.NODE_ENV)
const sharder = new ShardingManager("./bot.js",{token : process.env.NODE_ENV != "production" ? process.env.TEST_DISCORD_TOKEN : process.env.DISCORD_TOKEN, mode:"process"})
let OldConsoleLogPointer = new WeakRef(console.log)

if (require.main == module) { 

    console.warn = Logger.TLogN.bind(this,"WARN",chalk.bgYellow.black);
    console.error = Logger.TLogN.bind(this,"ERROR",chalk.bgRedBright.black);

    console.log("spawning shards")
    sharder.spawn().then(_=>{
        console.log("all shards spawned, initalizing web server.")
        startServer.call({...global,console:{log:Logger.TLogN.bind(this,"SERVER",chalk.bgGreenBright.black)}})
    })
}

let prisma = new PrismaClient()

export {sharder as shardingManager,OldConsoleLogPointer,prisma}