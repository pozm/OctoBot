import express from "express";
import {inspect} from "util";
import {splitter, uuid} from "./index";
import {Logger} from "../../Utils/Logging";
import chalk from "chalk";
import path from "path";
import {writeFileSync} from "fs";

// yes i wrote this.

interface root {
    _type:"export",
    "__export_format": 4,
    "__export_date": string,
    "__export_source": string,
    resources: ( structData | structGroup | structReq | structWrk )[]
}

interface structWrk extends structDefault{
    name: string;
    description: string;
    scope: string;
}

interface structReq extends structDefault{

    url: string;
    name: string;
    description: string;
    method: string;
    body: Body;
    parameters: any[];
    headers: any[];
    authentication: {};
    metaSortKey: number;
    isPrivate: boolean;
    settingStoreCookies: boolean;
    settingSendCookies: boolean;
    settingDisableRenderRequestBody: boolean;
    settingEncodeUrl: boolean;
    settingRebuildPath: boolean;
    settingFollowRedirects: string;
}
interface structGroup extends structDefault{
    name: string;
    description: string;
    environment: {};
    environmentPropertyOrder?: any;
    metaSortKey: number;

}
interface structData extends structDefault {
    fileName: string;
    contents: string;
    contentType: string;
}

declare module structEnv {

    export interface Data {
        [x:string]:string
    }

    export interface DataPropertyOrder {
        ["&"]: string[];
    }

    export interface RootObject extends structDefault {
        name: string;
        data: Data;
        dataPropertyOrder: DataPropertyOrder;
        color?: any;
        isPrivate: boolean;
        metaSortKey: number;
    }

}

interface structSpec extends structDefault{
    fileName: string;
    contents: string;
    contentType: string;
}

interface structDefault {
    _id: string;
    parentId: string;
    modified: number;
    created: number;
    _type:string;
    description:string
}

enum types {
    workspace = "wrk",
    request_group = "fld",
    request = "req",
    api_spec="spc",
    environment="env"
}

export namespace InsomniaExporter {

    export class Exporter {

        private Object : root = {
            __export_date: inspect(new Date()),
            __export_format:4,
            _type:"export",
            __export_source:"Node_Js Exporter.",
            resources: [
            ]
        }
        private sorting :number = 0;
        readonly projectName : string
        private mapping : {[x:string]:string} = {}
        private domain :string
        private port : number
        get url() {
            return `${this.domain}:${this.port}`
        }

        constructor(app:express.Application,ProjectName:string="Auto Generated insomnia export",Domain:string="http://localhost",Port:number=42547) {
            this.projectName = ProjectName
            this.domain = Domain;
            this.port = Port

            this.Object.resources.push(
                {...this.genEmptyFromType(types.workspace,"root"), name: this.projectName,description:"", scope:"collection"} as structWrk,
                // {...this.genEmptyFromType(types.api_spec,"spec"), fileName: this.projectName,description:"", contents:"", contentType:"yaml"} as structSpec
            )

            app._router.stack.forEach(this.print.bind(this, []))
            let px = path.join(__dirname,"../../Insomnia_Export")
            console.log(`Going to write to ${px}`)
            writeFileSync(`${px}/Export-${ "auto" ?? new uuid().toString()}.json`,JSON.stringify(this.Object,null,4,))

        }

        makePath(x:string[],m :string) : string {
            let last = ''
            for (let ix in x) {
                let i = parseInt(ix)
                let thisRoute = decodeURI(x[i])
                let end = i == x.length -1
                let upTo = x.slice(0,i+1)
                if (!end) {
                    if (this.mapping[upTo.join('_')]){
                        last = this.mapping[upTo.join('_')]
                        continue
                    }
                    let idx = this.Object.resources.push({...this.genEmptyFromType(types.request_group,upTo.join('_'),last || this.mapping['root']), name:thisRoute ?? "UNKNOWN", metaSortKey:++this.sorting,environment:{},environmentPropertyOrder:null} as structGroup)
                    last = this.Object.resources[idx-1]._id
                } else {
                    let idx = this.Object.resources.push({...this.genEmptyFromType(types.request,upTo.join('_'),last || this.mapping['root']), name:thisRoute?? "UNKNOWN", metaSortKey:++this.sorting,url:this.url + '/'+upTo.join('/'), method:m,isPrivate:false} as structReq)

                    last = this.Object.resources[idx-1]._id
                    break;
                }
            }
            return last
        }

        genEmptyFromType<T extends structDefault>(t : types,n:string,p?:string) : T | structDefault  {
            let obj =  {
                _id: `${t}_${new uuid().toString().replace(/-/gmi,"")}`,
                created: Date.now(),
                modified: Date.now(),
                _type:`${Object.keys(types)[Object.values(types).indexOf(t)]}`,
                parentId:p??null,
                description:''
            } as T
            if (t != types.request)
                this.mapping[n]=obj._id
            return obj;
        }

        print (path:string[], layer : any) {
            if (layer.route) {
                layer.route.stack.forEach(this.print.bind(this, path.concat(splitter(layer.route.path))))
            } else if (layer.name === 'router' && layer.handle.stack) {
                layer.handle.stack.forEach(this.print.bind(this, path.concat(splitter(layer.regexp))))
            } else if (layer.method) {
                if (layer.name != "<anonymous>") return
                let method = layer.method.toUpperCase()
                let xpath = path.concat(splitter(layer.regexp)).filter(Boolean);
                this.makePath(xpath,method)

            }
        }

    }

}
