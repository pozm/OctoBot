import express from "express";
import {ErrHandler} from "../index";
import {Response} from "../Utils/Response";
import axios from "axios";
import x, {Prisma} from "@prisma/client";

type MainClassTypes = String | Number | Boolean | Object | {[x:string]:any} | string[] | null | undefined

// there is more but i highly doubt we will be encountering them.
export function GetType(x:any) : "String" | "Number" | "Boolean" | "Object" {
	return x.name ?? Object.getPrototypeOf(x).constructor.name;
}

export function VerifyObjects(ref:{[x:string]:any}, obj2:{[x:string]:any}) {
	// make sure that obj2 has every key that ref has.
	let xkeys = Object.keys(obj2)
	if (!Object.keys(ref).filter(v=>!v.startsWith('_')).every(v=>xkeys.includes(v)))
		return null;
	let xobj : {[x:string]:any} = {};
	for (let [idx,val] of Object.entries(obj2)) {
		let realValue = ref[idx];
		if (!realValue && idx.startsWith("_"))
			continue;
		let parsed = AttemptParse(val,realValue)
		if (GetType(realValue) == GetType(parsed))
			xobj[idx]=parsed;
		else
			return null;
	}
	return xobj;
}

export function AttemptParse(value:any, type : MainClassTypes) : MainClassTypes {
	let valType = GetType(value);
	let typeString = GetType(type); // Will return the string version of the class name.
	if (typeString == "Object" && (!["String","Object"].includes(valType)))
		return null;
	if (valType == typeString && valType != "Object")
		return value;
	switch (typeString) {
		case "String": {
			return value.toString(); // there should always be a String method
		} break;
		case "Boolean":{ // could make it not check if it equals false, but i rather be strict.
			return valType == "String" ? value == "true" ? true : value == "false" ? false : null : valType == "Number" ? !!value : value;
		}
		case "Number":{
			let parsed = parseInt(value.toString());
			return isNaN(parsed) ? null : parsed;
		}
		case "Object":{
			let xval = value;
			try {
				if (valType == "String")
					xval = JSON.parse(value)
				let obj = VerifyObjects(type as {[x:string]:any},xval)
				if (!obj) {
					return null;
				} else
					return obj;
			} catch {
				return null;
			}
		}
	}
}

export function ValidateProps(select? : MainClassTypes) {
	const ignore = !Object.keys(select ?? {}).length
	return function _(req:express.Request,res:express.Response,n:express.NextFunction) {
		if (ignore)
			n();
		if(!req.body)
			return n([Response.InvalidBody,'You have no fields in the body.',400])
		let parsed = AttemptParse(req.body,select);
		// console.log(parsed)
		if (parsed) {
			res.locals.Props = parsed
			n();
		} else {
			return n([Response.InvalidBody,'You have incorrect fields in the body.',400])
		}
	}
}
