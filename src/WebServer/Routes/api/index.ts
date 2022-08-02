import * as Express from 'express';

import Bodyparser from "body-parser";
import {shardingManager} from "../../../index";
const Route = Express.Router()

// Route.use()


// testing
Route.get("/", (_: Express.Request, res : Express.Response) => {
	res.send("ok skid")
})
Route.get("/clientTest", async (_: Express.Request, res : Express.Response) => {
    res.send(await shardingManager.broadcastEval(c=>{
        return c.user?.tag
    }))
})

export default Route;
