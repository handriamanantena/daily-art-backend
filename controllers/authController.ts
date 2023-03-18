import jwt from "jsonwebtoken";
import config from "../config/config";
import {NextFunction, Request, Response} from "express";
import {ArtistDB} from "../model/Artist";
import {ArtistMongodb} from "../authentication/artistmongodb";
const bcrypt = require('bcryptjs');
const loginClient = new ArtistMongodb();


export const handleAuthentication = async (req : Request, res : Response, next: NextFunction) => {
    console.log("inside middleware")
    const authHeader = req.headers.authorization;
    let password = req.body.password;
    let userName = req.body.userName;
    //let objectId = new mongoDB.ObjectId(userID);
    let artist : ArtistDB = await loginClient.getArtistByUserName(userName); //TODO user is entering their email need to change front end
    console.log(artist)
    if(artist == undefined || artist?._id == undefined) {
        res.status(401);
        res.send("User not Unauthorized");
    }
    console.log(artist);
    console.log(req.body);
    const match = await bcrypt.compare(password, artist.password /* hashed */);
    console.log("is match: ", match);
    if(match) {
        next();
    }
    else {
        res.status(401);
        res.send();
    }
}

export const logout = (req : Request, res : Response, next: NextFunction) => {
    console.log("logging out");
    res.clearCookie("jwt");
    res.send({});
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
        jwt.verify(
            token,
            config.token.secret,
            (err, decoded) => {
                if (err) {
                    console.log("cant verify login")
                    res.status(401);
                    return res.send();
                }
                else {
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


export default {handleAuth: handleAuthentication};