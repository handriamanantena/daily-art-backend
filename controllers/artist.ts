import {NextFunction, Request, Response} from "express";
import {Artist, ArtistDB} from "../model/Artist";
import jwt from "jsonwebtoken";
import {GoogleLogin} from "../authentication/googleLogin";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
import {getResources} from "./genericApi";
import {ParsedQs} from "qs";
import {UpdateResult, Document} from "mongodb";
import * as mongoDB from "mongodb";
import {generateTokens} from "./authController";
import {JwtPayload} from "../model/JwtPayload";
const googleLogin = new GoogleLogin();
const mongodbClient = new MongoDBClient();
const bcrypt = require('bcryptjs');

export async function login (req: Request, res: Response, next: NextFunction) {
    //let session = req.session;
    let platform = req.query.platform;
    /*if(session.artist) {
        console.log("returning artist in session")
        return res.send(session.artist)
    }*/
    let artist: Artist;
    if(platform == 'google') {
        if(req.header("Authorization") != undefined) {
            let token = req.header("Authorization")
            if(token) {
                token = token.replace("Bearer ", "")
            }
            let googleAccount = await googleLogin.verify(token);
            if(googleAccount && googleAccount.email != undefined) {
                artist = await mongodbClient.getOneResource<ArtistDB>("artist", {email: googleAccount.email}) as ArtistDB
                if(!artist) {
                    res.locals.googleAccount = googleAccount;
                    return registerArtist(req, res, next);
                }
            }
        }
        else {
            res.status(401);
            return res.send("Unauthorized");
        }
    }
    else {
        let password = req.body.password;
        let userName = req.body.userName;
        let artistDb : ArtistDB = await mongodbClient.getOneResource<ArtistDB>("artist", {userName : userName}); //TODO user is entering their email need to change front end
        console.log(artistDb)
        if(artistDb == undefined || artistDb?._id == undefined) {
            res.status(404);
            return res.send("User Id does not exist");
        }
        console.log(artistDb);
        console.log(req.body);
        const match = await bcrypt.compare(password, artistDb.password);
        console.log("is match: ", match);
        if(!match) {
            res.status(401);
            return res.send("Unauthorized");
        }
    }
    // @ts-ignore
    if(artist) {
        delete artist['password'];
        let artistDB : ArtistDB = artist as ArtistDB;
        let accessToken = generateTokens({ userName: artist.userName, email: artist.email, id: artistDB._id.toString()}, res);
        res.status(200);
        return res.send({artist: artistDB, accessToken: accessToken});
    }
    else {
        res.status(500);
        return res.send("Unable to retrieve artist");
    }
}

export async function registerArtist (req: Request, res: Response, next: NextFunction) {
    try {
        let artist : Artist;
        let dbResponse;
        if(res.locals?.googleAccount) {
            artist = {
                userName: await generateUniqueUserNameFromEmail(res.locals?.googleAccount.name),
                email: res.locals.googleAccount.email,
                profilePicture: res.locals.googleAccount.picture,
            } as Artist;
        }
        else {
            let artistInfo = req.body;
            console.log("body of register is", req.body)
            //@ts-ignore
            let hashedPassword = await bcrypt.hash(artistInfo.password, +(process.env.DATABASE_SALT_ROUNDS));
            if(artistInfo.password == '' || artistInfo.email == '') {
                res.status(400);
                return res.send("password or email is blank");
            }
            artist = {
                userName: await generateUniqueUserNameFromEmail(artistInfo.email.split("@")[0]),
                email: artistInfo.email,
                profilePicture: "",
                password: hashedPassword
            };
        }
        dbResponse = await mongodbClient.addNewResource("artist", artist);
        console.log("db response " + JSON.stringify(dbResponse));
        if (dbResponse && dbResponse.acknowledged && dbResponse.insertedId) {
            delete artist.password;
            let artistDB : ArtistDB = artist as ArtistDB;
            artistDB._id = dbResponse.insertedId;
            let accessToken = generateTokens({ userName: artistDB.userName, email: artistDB.email, id: artistDB._id.toString()}, res);
            console.log("response " + JSON.stringify(accessToken));
            res.status(201);
            return res.send({artist: artistDB, accessToken});
        }
        else {
            res.status(422);
            return res.send(dbResponse);
        }
    }
    catch (e: any) {
        if(e.code == 11000) {
            res.status(409);
            return res.send("Email already in use");
        }
        console.error(e);
        res.status(500);
        return res.send("Internal error");
    }
}

export async function generateUniqueUserNameFromEmail(userName: string) : Promise<string>{
    let isUnique = false;
    while(!isUnique) {
        console.log("loop");
        let tempUserName = userName;
        let resource = await mongodbClient.getOneResource("artist", {userName: tempUserName});
        if(resource) {
            userName+=Math.floor((Math.random() * 100000) + 1).toString();
        }
        else {
            isUnique = true;
            userName = tempUserName;
        }
    }
    return userName;
}

export async function getArtistUserNames(req: Request, res: Response, next: NextFunction) {
    let usernames = await (await mongodbClient.getDistinctResources("artist", {}, {userName: 1}));
    console.log(usernames);
    if(usernames) {
        res.status(200);
        return res.send(usernames);
    }
    else {
        res.status(404);
        return res.send(usernames);
    }
}

async function getPage(pageIndex: string, pageSize: number, filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1|0}) {
    return await mongodbClient.getAggregate("artist", undefined, "", "", "",
        "profilePicture", "_id", pageIndex, pageSize, filterTerms, searchText, fields);
}

function setKeysForFilter(urlQuery : ParsedQs) : {[key: string]: any} {
    let userName = urlQuery.userName as string;
    let filterKeys: {[key: string]: any} | undefined = {};
    if(userName) {
        filterKeys.userName = userName;
    }
    return filterKeys;
}

export async function getArtists (req: Request, res: Response, next: NextFunction) {
    let pictures = await getResources(req, res, next, setKeysForFilter, getPage);
    console.log("inside" + JSON.stringify(pictures));
    if(pictures) {
        return res.send(pictures);
    }
    else {
        res.status(404);
        return res.send();
    }
}


export async function updateArtist(req: Request, res: Response, next: NextFunction) {
    if(req.body.password) {
        delete req.body.password;
    }
    let updates = { $set : req.body};
    let artistId = res.locals.token.id;
    let objectId = {};
    try {
        objectId = new mongoDB.ObjectId(artistId);
    }
    catch (e) {
        console.error(e);
        res.status(500);
        return res.send("Error with artist id in token");
    }
    try {
        if(updates.$set.userName) {
            updates.$set.userName = updates.$set.userName.trim();
        }
        let artistResult: UpdateResult = await mongodbClient.updateResource("artist", {_id: objectId}, updates,
            {upsert: false});
        let pictureResult: UpdateResult | Document = {};
        if(artistResult.modifiedCount == 1) {
            if(updates.$set.userName) {
                let pictureUpdate = { $set : {userName : updates.$set.userName}};
                pictureResult = await mongodbClient.updateResources("pictures",
                    {userName: res.locals.token.userName}, pictureUpdate,
                    {upsert: false});
                let payload : JwtPayload = {
                    userName: updates.$set.userName,
                    id: artistId,
                    email: res.locals.token.email
                };
                let accessToken = generateTokens(payload, res);
                res.status(201);
                return res.send({accessToken: accessToken, artistResult: artistResult, pictureResult: pictureResult});
            }
            res.status(201);
            return res.send(artistResult);
        }
        else {
            res.status(422);
            return res.send(artistResult);
        }
    }
    catch (e : any) {
        if (e.code == 11000) {
            res.status(409);
            return res.send("email or username already in use");
        }
        console.error(e);
        res.status(500);
        return res.send("Internal error");
    }
}
