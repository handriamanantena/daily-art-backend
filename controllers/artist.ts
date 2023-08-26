import {NextFunction, Request, Response} from "express";
import {Artist, ArtistDB} from "../model/Artist";
import jwt from "jsonwebtoken";
import {GoogleLogin} from "../authentication/googleLogin";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
import {getResources} from "./genericApi";
import {ParsedQs} from "qs";
import {UpdateResult} from "mongodb";
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
        artist = await mongodbClient.getOneResource<ArtistDB>("artist", {userName : userName}); //TODO user is entering their email need to change front end
        console.log(artist)
        if(artist == undefined || artist?._id == undefined) {
            res.status(404);
            return res.send("User Id does not exist");
        }
        console.log(artist);
        console.log(req.body);
        const match = await bcrypt.compare(password, artist.password /* hashed */);
        console.log("is match: ", match);
        if(!match) {
            res.status(401);
            return res.send("Unauthorized");
        }
    }
    // @ts-ignore
    if(artist) {
        delete artist['password'];
        let response = generateTokens(artist, res);
        res.status(200);
        return res.send(response);
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
                email: artistInfo.email,
                profilePicture: "",
                password: hashedPassword
            };
        }
        dbResponse = await mongodbClient.addNewResource("artist", artist);
        console.log("db response " + JSON.stringify(dbResponse));
        if (dbResponse && dbResponse.acknowledged && dbResponse.insertedId) {
            delete artist.password;
            artist._id = dbResponse.insertedId;
        }
        let response = generateTokens(artist, res);
        console.log("response " + JSON.stringify(response));
        res.status(201);
        return res.send(response);
    }
    catch (e) {
        console.log(e);
        //if (e.toString().contains("sdf"))
        res.status(500);
        return res.send("can not register user");
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
    return await mongodbClient.getAggregate("artist", undefined, "", "", "", pageIndex, pageSize, filterTerms, searchText, fields);
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

export function generateTokens(artist : Artist, res : Response) {
    // @ts-ignore
    let accessToken = jwt.sign({ userName: artist.userName, email: artist.email, profilePicture: artist.profilePicture }, process.env.TOKEN_SECRET, {expiresIn: process.env.TOKEN_EXPIRE});
    // @ts-ignore
    const refreshToken = jwt.sign({ userName: artist.userName, email: artist.email, profilePicture: artist.profilePicture }, process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );
    res.header('Access-Control-Allow-Credentials', "true"); // TODO check allowed origins
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
    let response = {
        artist,
        accessToken
    }; // TODO try setting jwt token in cookie instead httpOnly true, however return artist info as well. store artist info Context in front end
    console.log("generated token" + JSON.stringify(response));
    return response;
}

export async function updateArtist(req: Request, res: Response, next: NextFunction) {
    if(req.body.password) {
        delete req.body.password;
    }
    let updates = { $set : req.body};
    let email = decodeURIComponent(req.params.email);
    let result : UpdateResult = await mongodbClient.updateResource("artist", {email: email}, updates,
        {upsert : false});
    console.log(result);
    if(result.modifiedCount == 1) {
        res.status(201);
    }
    else {
        res.status(409);
    }
    return res.send();
}
