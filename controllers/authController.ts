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
        console.log("missing token");
        res.status(403);
        res.send();
    }
}

export const logout = (req : Request, res : Response, next: NextFunction) => {
    console.log("logging out");
    res.clearCookie("jwt");
    res.send({});
}

export const login = (req : Request, res : Response, next: NextFunction) => {
    console.log("inside router")
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        console.log("Bad Bearer")
        res.sendStatus(401);
    }
    const token = authHeader?.split(' ')[1];
    console.log(token);
    if(token) {
        console.log("verify login")
        jwt.verify(
            token,
            config.token.secret,
            (err, decoded) => {
                if (err) {
                    console.log("cant verify login")
                    res.status(403);
                    res.send();
                } //invalid token
            }
        );
    }
    else {
        res.status(200);
        res.send();
    }
}

export const refresh = (req : Request, res : Response, next: NextFunction) => {
    const cookies = req.cookies;
    console.log("cookies :" + cookies.jwt);
    if (!cookies?.jwt) {
        console.log("bad cookie");
        return res.sendStatus(401);
    }
    const refreshToken = cookies.jwt;

    // evaluate jwt
    jwt.verify(
        refreshToken,
        config.refreshToken.secret,
        (err: any, decoded: any) => {
            if(err) {
                res.sendStatus(403);
            }
            const accessToken = jwt.sign(
                {},
                config.token.secret,
                { expiresIn: config.token.expire }
            );
            res.send({ accessToken })
        }
    );
}


export default {handleAuth};