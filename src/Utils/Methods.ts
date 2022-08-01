import { CommandsSet } from './../bot';
import { CommandModuleData } from "./ModuleLoader";

export function getrnd(min : number, max : number) {
    return Math.round(Math.random() * (max - min) ) + min;
}
export function uuidv4 () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
export function FetchCommandByNameOrAlias(Query:string) : undefined | CommandModuleData {
    let commands = CommandsSet.values()
    if (!commands)
        return;
    // return undefined;
    return [...commands].find(cmd=>{
        let c = cmd.Instance!
        return c?.name?.toLowerCase() == Query //|| c?.Aliases?.includes(Query)
    })
}


const prod = process.env.NODE_ENV == "production"
function ifDev(ifso:any,ifnot:any) {
    if (prod)
        return ifnot
    return ifso
}
function ifProd(ifso:any,ifnot:any) {
    if (prod)
        return ifso
    return ifnot
}
export {ifDev,ifProd, prod as isProd}