import express from "express";
import {ErrHandler} from "../index";
import {Response} from "../Utils/Response";
import axios from "axios";
import x, {Prisma} from "@prisma/client";
import {BindMiddleWare} from "./Util";

export function GetUser(select? : any) {
	return BindMiddleWare(requireLogin,function _(req,res,n){
		// prisma.user.findFirst({
		// 	select,
		// 	where:{
		// 		Id: req.session.userId
		// 	}
		// }).then(usr=>{
		// 	if (!usr) {
		// 		n([Response.Require_Login,'This endpoint requires you to be logged in.',400])
		// 	}
		// 	res.locals.User = usr as any;
		// 	n()
		// },err=>{
		// 	console.error(err, '?????')
		// 	n([Response.Require_Login,'This endpoint requires you to be logged in.',400])
		// })
	})
}
export async function ValidCaptcha(req:express.Request,res:express.Response,n:express.NextFunction) {
	// let {captcha} = req.body;
	// let verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${captcha}&remoteip=${req.ip ?? req.connection.remoteAddress}`;

	// let succ = await (axios.get(verificationUrl).then((v)=>v.data.success,v=>false))
	// if (!succ)
	// 	return n([Response.Require_Login,'The captcha provided is invalid, are you sure you\'re not a robot? 🤖',400])
	n();
}
export function requireLogin(req:express.Request,res:express.Response,n:express.NextFunction) {
	// if (!req.session.userId) {
	// 	return n([Response.Require_Login,'This endpoint requires you to be logged in.',400])
	// }
	// lets trust the session object...
	return n()
}
