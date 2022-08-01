import {OldConsoleLogPointer} from "../index";
import {inspect} from "util";
import chalk from "chalk";


export function Clamp(num : number,min : number,max : number) {
    return Math.min(Math.max(num, min), max);
}
function fillText(t : string) {
    let size = process.stdout.columns
    return t + ' '.repeat(Clamp(0,size-t.length,Number.MAX_SAFE_INTEGER))
}

class LoggerClass {
    public Custom : {[x:string]:(...s : any[])=>void}
    private Store : {[ID:string]:number}
    constructor() {
        this.Custom = {}
        this.Store = {}
    }
    Log(t : string= "LOG" ,...s : any[]) {
        let oldConsoleLog = OldConsoleLogPointer.deref()
        if (!oldConsoleLog)
            return
        oldConsoleLog(`[${chalk.greenBright(t)}] >`,...s)
    }
    CLog(t : string= "LOG", c:chalk.Chalk ,...s : string[]) {
        process.stdout.write(`[${c(t)}] > ${s.join(', ')}`)
    }
    TLog(t : string="LOG",c:chalk.Chalk, ...s : string[]) {
        // lol same
        process.stdout.write(`${c(` ${t} `)}\t${s.join(', ')}`)
    }
    TLogN(t : string="LOG",c:chalk.Chalk, ...s : string[]) {
        // lol same
        process.stdout.write(`${c(` ${t} `)}\t${s.map(v=>inspect(v)).join(', ')}\n`)
    }

}

export const Logger = new LoggerClass()
