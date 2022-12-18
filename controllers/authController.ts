import jwt from "jsonwebtoken";
import config from "../config/config";
import {NextFunction, Request, Response} from "express";


export const handleAuth = async (req : Request, res : Response, next: NextFunction) => {
    console.log("inside middleware")
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        console.log("Bad Bearer")
        res.sendStatus(401);
    }
    const token = authHeader?.split(' ')[1];
    console.log(token);
    if(token) {
        console.log("verify token")
        jwt.verify(
            token,
            config.token.secret,
            (err, decoded) => {
                if (err) {
                    console.log("verify token failed")
                    res.status(403);
                    res.send();
                } //invalid token
            }
        );
    }
    else {
        next()
    }
}

export default {handleAuth};