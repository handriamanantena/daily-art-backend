import {Picture, PictureDB} from "./model/picture";
import { Picturesmongodb } from "./picturesmongodb";
import { Commentmongodb } from "./commentmongodb";

import express, {NextFunction, Request, Response} from 'express';
import type { ErrorRequestHandler } from "express";
import { HttpError, Http404Error } from "./error/HttpErrors"
import {GoogleLogin} from "./authentication/googleLogin"
import {ArtistMongodb} from "./authentication/artistmongodb";
import {Artist, ArtistDB} from "./model/Artist";
import config from "./config/config";
import {Session, SessionData} from "express-session";
import jwt from "jsonwebtoken";
import authController from "./controllers/authController";
import * as core from "express-serve-static-core";
const app = express()
const port = 3001
// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
let cors = require('cors')
const pictureMongodb = new Picturesmongodb();
const commentMongodb = new Commentmongodb();
const googleLogin = new GoogleLogin();
const loginClient = new ArtistMongodb();
const sessions = require('express-session');
const authenticate  = require("./router/authenticate")
const cookies = require("cookie-parser");

app.use(sessions({
    secret: config.session.secret,
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));


app.use(cors({
    origin : config.host + ":3000",
    credentials: true,
}));
app.use(express.json());

let unless = (middleware : core.Router, paths : string[]) => {
    return function(req : Request, res : Response, next: NextFunction) {
        console.log("testing path " + req.path);
        const pathCheck = paths.some(path => req.path.match(path));
        pathCheck ? next() : middleware(req, res, next);
    };
}
app.use(unless(authenticate, ["/login", "/artist", "\/pictures.*", "\/file\/.*", "/refresh", "/logout"]));


//app.use("/", authenticate);


app.use(cookies())


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.get("/logout", (req, res, next) => {
    console.log("logging out");
    res.clearCookie("jwt");
    res.send({});
})

app.post("/login", (req, res) => {
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
})

app.post("/refresh", (req, res) => {
    const cookies = req.cookies
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
})

app.post('/artist', async function (req, res) {
    let session = req.session;
    let platform = req.query.platform;
    //res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    /*if(session.artist) {
        console.log("returning artist in session")
        return res.send(session.artist)
    }*/
    if(platform == 'google') {
        if(req.header("Authorization") != undefined) {
            let token = req.header("Authorization")
            if(token) {
                token = token.replace("Bearer ", "")
            }
            let googleAccount = await googleLogin.verify(token)
            if(googleAccount && googleAccount.email != undefined) {
                let artist = await loginClient.getArtistByEmail(googleAccount.email) as Artist
                delete artist['password'];
                session.artist = artist;
                if(!artist) {
                    let artistDB = {
                        userName: googleAccount.name,
                        email: googleAccount.email,
                        password: '',
                        profilePicture: googleAccount.picture,
                    } as Artist
                    await loginClient.addNewArtist(artistDB)
                }
                let accessToken = jwt.sign(artist, config.token.secret, {expiresIn: config.token.expire});
                const refreshToken = jwt.sign(
                    { "username": artist.userName },
                    config.refreshToken.secret,
                    { expiresIn: config.refreshToken.expire }
                );
                //    if (allowedOrigins.includes(origin))
                res.header('Access-Control-Allow-Credentials', "true"); // TODO check allowed origins
                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
                return res.send({accessToken});
            }
        }
    }
})

app.get('/file/:name', function (req, res, next) {
    let options = {
        root: 'F:\\art\\pictures\\test\\',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }
    let fileName = req.params.name

    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err)
        } else {
            console.log('Sent:', fileName)
        }
    })
})

app.get('/pictures/:id', function (req, res, next) {
    let pictureId = req.params.id
    pictureMongodb.getPictureById(pictureId).then(((value: Picture) => {
            console.log('outside', value)
            if(value) {
                res.send(value)
            }
            else {
                throw new Http404Error({
                    error: {
                        message: "picture not found",
                        innerError: {}
                    }
                })
            }
        }
    )).catch((e : Error) => {
        /*next(new HttpError({
            error: {
                message: e.message,
                innerError: e.stack
            }
        }))*/
        next(e)
    })
})


app.get('/pictures', function (req, res, next) {
    let date = req.query.date as string
    let name = req.query.name as string
    if(date) {
        pictureMongodb.getPicturesByDate(new Date(date)).then((value => {
            if(value) {
                res.send(value)
            }
            else {
                res.status(404)
                res.send({value: 'not found'})
            }

        })).catch(e => {
            console.log(e)
            res.send(e)
        })
    }
    let page = req.query.page
    if(page) {
        let pageNumber = Number(page);
        console.log('inside')
        pictureMongodb.getGalleryByPage(pageNumber).then((value => {
            if(value) {
                res.send(value)
            }
            else {
                res.status(404)
                res.send({value: 'not found'})
            }

        })).catch(e => {
            console.log(e)
            res.send(e)
        })
    }
    else if(name) {
        pictureMongodb.getPictureByName(name).then(((value: Picture) => {
                if(value) {
                    res.send(value)
                }
                else {
                    throw new Http404Error({
                        error: {
                            message: "picture not found",
                            innerError: {}
                        }
                    })
                }
            }
        )).catch((e : Error) => {
            next(e)
        })
    }
    else {
        pictureMongodb.getAllPictures().then((value => {
            if(value) {
                res.send(value)
            }
            else {
                res.status(404)
                res.send({value: 'pictures not found'})
            }

        })).catch(e => {
            console.log(e)
            res.send(e)
        })
    }
})

app.patch('/pictures/', function(req, res) {
    let pictureId = req.query.pictureId as string
    pictureMongodb.insertReplyOnRecentComment(req.body, pictureId).then(value => {
        res.send(value)
    }).catch(e => {
        console.log(e)
        res.send(e)
    })
})



//TODO create seperate file for this
app.post('/comment/', function(req, res) {
    let pictureId = req.query.pictureId as string
    console.log("picture id {}", pictureId)
    console.log("body {}", req.body)
    commentMongodb.insertComment(req.body, pictureId).then((value) => res.send(value)).catch(e => {
        console.log(e)
        res.send(e)
    })
})

app.patch('/comment/', function(req, res) {
    let commentId = req.query.commentId as string
    commentMongodb.insertReplyOnPastComment(req.body, commentId).then(value => {
        res.send(value)
    }).catch(e => {
        console.log(e)
        res.send(e)
    })
})

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if(err instanceof Http404Error) {
        res.status(404)
        res.send(err.error)
    }
    else if(err instanceof HttpError){
        res.status(500)
        res.send(err.error)
    }
    else {
        res.status(500)
        res.send(err.message)
        console.error(err)
    }
};

app.use(errorHandler)

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})