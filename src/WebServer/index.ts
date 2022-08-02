import express, {Router} from "express"
import { PrismaClient } from '@prisma/client'

import {readdirSync, readFileSync, statSync} from "fs";
import path, {join} from 'path'
import VM from 'vm'
import {createRequire} from 'module'
import {Logger} from "../Utils/Logging";
import chalk from "chalk";
import {splitter} from "./Utils";
import {config} from "dotenv";
import {Response} from "./Utils/Response";

import {InsomniaExporter} from "./Utils/InsomniaExporter";
import {execFileSync} from "child_process";
import {Versioning} from 'native-utils-octo'
const app = express();


// load .env file.

config({})

// only trust if localhost proxy (x-forward properties = localhost & host.ip = localhost), so this will allow NGINX to work.
app.set('trust proxy',"loopback")
app.set('x-powered-by',false) // we use a custom x-powered-by (don't wanna leak shit :smile:)

// // express session used to keep sessions of users so they don't have to login again.
// // only necessary once web
// app.use(
//     expressSession({
//         cookie: {
//             maxAge: 7 * 24 * 60 * 60 * 1000 // ms
//         },
//         saveUninitialized:true,
//         resave:false,
//         proxy:true,
//         secret: 'H4sIAAAAAAAAAE2KsQ3AIADDbkKAQ85pK/H/CQRYOtmJjHnUgUFR5aUxwvKzL+402XGn6zJNumTu79SblpgLzlUAcFYAAAA=',
//         store: new PrismaSessionStore(
//             prisma as unknown as IPrisma,
//             {
//                 checkPeriod: 2 * 60 * 1000, // ms
//                 dbRecordIdIsSessionId: true,
//                 dbRecordIdFunction: undefined,
//             }
//         )
//     })
// );
//
// use for all requests
app.use((req,res,n)=>{

    res.header('x-powered-by',`Octo ${Versioning.getGitHash()} @ ${Versioning.getGitBranch()} (Rocket)`) // Say rocket to give potential attackers the wrong web framework.
    n()
})

type ErrHandleArgument = express.ErrorRequestHandler | [Response,string,number?, {[x:string]:any}?]

// error handler
export const ErrHandler = (err: ErrHandleArgument, req :express.Request, res: express.Response, next : express.NextFunction) => {

    if (Array.isArray(err)) {
        // if status is not already set, check if 3rd value in array and make it that, if not use 500 or if it already is defined other than 200, then use that.
        res.status(res.statusCode == 200 ?( err[2] ?? 500) : res.statusCode).json({
            c:err[0], // err code
            d:err[3] ?? {}, //data
            m:err[1] // err message
        })
        return

    }

    console.error(`Got error from : ${req.originalUrl} : ${req.ip}\nError:${(err as unknown as Error)?.stack ?? err}`)
    res.status(500).send('what')
    return;
}


// [ lazy ]
__dirname = join(__dirname,'Routes');

// Length of dir
const dirLength = __dirname.split(/\\|\//g).length

const oldConsoleLog = console.log
export const oldConsoleRef = new WeakRef(oldConsoleLog);

async function MountDir(path:string,Mount :express.Application | Router = app) {
    let PathSplit = path.split(/\\|\//g);
    let relPathOffset = PathSplit.length - dirLength;
    let relPath       = "/"+PathSplit.slice(-1).join('/')
    let Mounter = Mount
    let Files = readdirSync(path);
    let FilesIndexFirst = [...Files.filter(v=>v.toLowerCase() == "index.js"),...Files.filter(v=>v.toLowerCase() != "index.js")]
    for (let file of FilesIndexFirst) {
        let xpath     =  join(path,file);
        let stat      =  statSync(xpath)
        if (stat.isDirectory()) {
            // let it run asynchronously
            MountDir(xpath,Mounter)
        } else {
            if (!file.endsWith('.js'))
                continue;
            if (relPathOffset == 0 && file=="index.js")
                continue;
            try {
                let f = require(xpath);
                let buildRel = file == 'index.js' ? `${relPath}/` : '/'+ file.slice(0,-3)
                console.log(`> Mapped routes from ${relPath}/${file}\t<`)
                Mounter.use(buildRel,f.default)
                if (file == 'index.js') {
                    Mounter = f.default;
                }
            } catch {


                // unable to require // prob err.
                // -- we can find out that error at runtime by making a vm.

                // make fake require func.
                let fakeReq = createRequire(xpath)

                // make our fake context..
                let ctx = VM.createContext({require:fakeReq,console: {log:()=>{}},exports, setInterval,clearInterval ,process})

                // create the script to run

                let script = new VM.Script(readFileSync(xpath).toString(),{
                    filename:file,
                    timeout:2e3
                })

                // attempt to run the script
                try {

                    script.runInContext(ctx,{
                        filename:file,
                        timeout:2e3,
                        displayErrors:true,
                    })

                    console.warn(`${file} was unable to be imported; but still ran fine under vm`)

                } catch (e) {

                    console.error(`${file}: ${e}`)

                }
            }
        }
    }
}


export async function startServer()
{
        // wait for all directories to be mounted
        await MountDir(__dirname)
        // use it after so that next func works.
        app.use(ErrHandler)


        app.use("/static",express.static(join(__dirname,"..","..","..",'assets',"static")))

        console.log('\n      > Imported Routes <\n')
        // i recommend to collapse this block.
        {


            function print (path: any, layer : any) {
                if (layer.route) {
                    layer.route.stack.forEach(print.bind(null, path.concat(splitter(layer.route.path))))
                } else if (layer.name === 'router' && layer.handle.stack) {
                    layer.handle.stack.forEach(print.bind(null, path.concat(splitter(layer.regexp))))
                } else if (layer.method) {
                    if (layer.name != "<anonymous>") return
                    let c = '#9775DD'
                    let method = layer.method.toUpperCase()
                    switch (method) {
                        case 'GET' : break;
                        case 'PUT' : c = '#D19A66'; break;
                        case 'POST': c = '#40806E'; break;
                        case 'PATCH': c = '#D2A15C'; break;
                        case 'DELETE': c = '#E06C75'; break;
                        case 'HEAD': c = '#418EB5'; break;
                        case 'OPTIONS': c = '#418EB5'; break;
                    }
                    Logger.TLog(method,chalk.bgHex(c).black,`/${path.concat(splitter(layer.regexp)).filter(Boolean).join('/')}\n`)

                }
            }

            app._router.stack.forEach(print.bind(null, []))
            // de-initialize functions created after exiting, less memory consumption
        }

        console.log('\n')

        // new InsomniaExporter.Exporter(app)



        // we should probably change this when not in dev env
        const port = 42547;



        //@todo(pozm) we should probably listen on 0.0.0.0 on production, but right now we shouldn't worry.
        // actually after thinking about it we should probably be fine if using nginx - same with port.
        app.listen(port,()=>{
            Logger.TLog('READY',chalk.bgGreenBright.black,`Listening to localhost:${port}.\n\n`)
        })
}
