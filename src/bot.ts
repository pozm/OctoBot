import { Versioning } from 'native-utils-octo';
import chalk from "chalk";
import { Client, Intents } from "discord.js";
import { AutoReloader } from "./Utils/AutoReloader";
import { EventRegister } from "./Utils/Events/EventRegister";
import { Logger } from "./Utils/Logging";
import { CommandModuleData, EInitType, EventModuleData, FindModules } from "./Utils/ModuleLoader";
import { ifDev, isProd } from './Utils/Methods';

export const client = new Client({
    intents:[
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INVITES,
    ],
    partials:[
        "MESSAGE",
        "CHANNEL"
    ],
    ws:{
        properties:{
            $os:"iOS",
            $browser:"Discord iOS",
            $device:"Discord iOS"
        }
    }
})
let oldConsoleLog = console.log;
console.log = (...s) => oldConsoleLog.bind(oldConsoleLog)(`${chalk.bgBlueBright.black("BOT")} `, ...s)
let oldConsoleLog_ = console.log;
Logger.Custom.Command = (...s) => oldConsoleLog_.bind(oldConsoleLog_)(`[${chalk.keyword("orange")("CMD")}] >`, ...s)
Logger.Custom.Event = (...s) => oldConsoleLog_.bind(oldConsoleLog_)(`[${chalk.hex('#64b6d7')("EVT")}] >`, ...s)
console.warn = Logger.TLogN.bind(this,"WARN",chalk.bgYellow.black);
console.error = Logger.TLogN.bind(this,"ERROR",chalk.bgRedBright.black);

export const EventReg = new EventRegister(client)
export const CommandsSet = new Set<CommandModuleData>()
export const EventsSet = new Set<EventModuleData>()

console.log(`${chalk.greenBright("✓")} version=${Versioning.getGitHash().slice(0,6)}@${Versioning.getGitBranch()}`)

FindModules("./Commands",EInitType.Command)
FindModules("./Events",EInitType.Event)

if( !isProd) {
    new AutoReloader(".").Watch()
    console.log("WATCHING")
}

// return;
client.login().catch(console.error)