import express from "express";
import config from "../config/config";
import jwt, {Jwt, JwtPayload, SignOptions, VerifyOptions} from "jsonwebtoken";

let unless  = require("express-unless");

const login = express.Router()

/*login.use(
    unless.unless({
        path: ["/artist", { url: "/", methods: ["POST"] }],
    })
);*/

/*login.use("/", (req, res, next) => {
    console.log("inside router")
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    if(process.env.ACCESS_TOKEN_SECRET) {
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => {
                if (err) {
                    return res.sendStatus(403);
                } //invalid token
            }
        );
    }
    next();
})*/




module.exports = login
