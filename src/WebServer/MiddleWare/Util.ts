import express from "express";

type mw = (req:express.Request,res:express.Response,n:express.NextFunction)=>any

export function BindMiddleWare(...middleware : mw[]  ) {
    return middleware.flat(44)
}