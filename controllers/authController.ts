import jwt from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import {Artist, ArtistDB} from "../model/Artist";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
import {JwtPayload} from "../model/JwtPayload";
const bcrypt = require('bcryptjs');
const mongoDBClient = new MongoDBClient();

/**
 * Default alg HS256
 * */


export const logout = (req : Request, res : Response, next: NextFunction) => {
    console.log("logging out");
    res.clearCookie("jwt", {httpOnly: true, sameSite: 'none', secure: true, maxAge: 0, expires: Date.now() });
    res.status(200);
    return res.send("logging out");
}

export function verifyJwt (req : Request, res : Response, next: NextFunction) {
    console.log("verify jwt")
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        console.log("Bad Bearer")
        res.status(401);
        return res.send();
    }
    const token = authHeader?.split(' ')[1];
    console.log(token);
    if(token) {
        console.log("verify login")
        jwt.verify(token,
            // @ts-ignore
            process.env.TOKEN_SECRET,
            (err, decoded) => {
                if (err) {
                    console.log("cant verify login")
                    res.status(401);
                    return res.send();
                }
                else {
                    console.log("JWT verified");
                    res.locals.token = decoded;
                    next();
                }
            }
        );
    }
    else {
        res.status(401);
        return res.send();
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
        //@ts-ignore
        process.env.REFRESH_TOKEN_SECRET,
        (err: any, decoded: any) => {
            if(err) {
                console.error("refresh failed");
                res.sendStatus(403);
            }
            let jwtPayload : JwtPayload = {
                userName: decoded.userName,
                email: decoded.email,
                id: decoded.id
            }
            const accessToken = jwt.sign(jwtPayload,
                //@ts-ignore
                process.env.TOKEN_SECRET,
                { expiresIn: process.env.TOKEN_EXPIRE }
            );
            res.send({ accessToken })
        }
    );
}


export function generateTokens(jwtPayload : JwtPayload, res : Response) {
    // @ts-ignore
    let accessToken = jwt.sign(jwtPayload, process.env.TOKEN_SECRET, {expiresIn: process.env.TOKEN_EXPIRE});
    // @ts-ignore
    const refreshToken = jwt.sign(jwtPayload, process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );
    res.header('Access-Control-Allow-Credentials', "true"); // TODO check allowed origins
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
    let response = {
        jwtPayload,
        accessToken
    }; // TODO try setting jwt token in cookie instead httpOnly true, however return artist info as well. store artist info Context in front end
    console.log("generated token" + JSON.stringify(response));
    return response;
}