import {NextFunction, Request, Response} from "express";
import {Artist, ArtistDB} from "../model/Artist";
import jwt from "jsonwebtoken";
import {GoogleLogin} from "../authentication/googleLogin";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
const googleLogin = new GoogleLogin();
const mongodbClient = new MongoDBClient();
const bcrypt = require('bcryptjs');

export async function getArtist (req: Request, res: Response, next: NextFunction) {
    //let session = req.session;
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
                let artist = await mongodbClient.getOneResource<ArtistDB>("artist", {email: googleAccount.email}) as ArtistDB
                delete artist['password'];
                //session.artist = artist;
                if(!artist) {
                    let artistDB = {
                        userName: googleAccount.name,
                        email: googleAccount.email,
                        password: '',
                        profilePicture: googleAccount.picture,
                    } as Artist;
                    await mongodbClient.addNewResource("artist", artistDB);
                }
                let response = await generateTokens(artist, res);
                console.log("the response: " + JSON.stringify(response))
                return res.send(response);
            }
        }
    }
    else {
        let password = req.body.password;
        let userName = req.body.userName;
        //let objectId = new mongoDB.ObjectId(userID);
        let artist : ArtistDB = await mongodbClient.getOneResource<ArtistDB>("artist", {userName : userName}); //TODO user is entering their email need to change front end
        console.log(artist)
        if(artist == undefined || artist?._id == undefined) {
            res.status(404);
            res.send("User Id does not exist");
        }
        console.log(artist);
        console.log(req.body);
        const match = await bcrypt.compare(password, artist.password /* hashed */);
        console.log("is match: ", match);
        if(match) {
            let response = generateTokens(artist, res);
            res.send(response);
        }
        else {
            res.status(401);
            res.send("Unauthorized");
        }
    }
}

export async function registerArtist (req: Request, res: Response, next: NextFunction) {
    console.log("inside register")
    let artistInfo = req.body;
    console.log("body of register is", req.body)
    if(artistInfo.password == '' || artistInfo.email == '') {
        res.status(400);
        return res.send("password or email is blank");
    }
    let hashedPassword = await bcrypt.hash(artistInfo.password, process.env.DATABASE_SALT_ROUNDS);
    let artist : Artist = {
        email: artistInfo.email,
        pictures: [],
        profilePicture: "",
        userName: "",
        password: hashedPassword
    }
    if(artistInfo.email.includes("harrison") || artistInfo.email.includes("anosirrah")) { // TODO need SCHEMA to make email unique
        res.status(409);
        return res.send("email already in use");
    }
    let dbResponse = await mongodbClient.addNewResource("artist", artist);
    if(dbResponse && dbResponse.acknowledged && dbResponse.insertedId) {
        let artist : ArtistDB = artistInfo;
        artist._id = dbResponse.insertedId;
        let response = generateTokens(artist, res);
        res.status(201);
        return res.send(response);
    }
    else {
        res.status(500);
        return res.send("issue registering account");
    }
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

async function generateTokens(artist : Artist, res : Response) {
    // @ts-ignore
    let accessToken = jwt.sign({ userName: artist.userName, email: artist.email }, process.env.TOKEN_SECRET, {expiresIn: process.env.TOKEN_EXPIRE});
    // @ts-ignore
    const refreshToken = jwt.sign({ userName: artist.userName, email: artist.email }, process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );
    res.header('Access-Control-Allow-Credentials', "true"); // TODO check allowed origins
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
    let response = {
        artist,
        accessToken
    }; // TODO try setting jwt token in cookie instead httpOnly true, however return artist info as well. store artist info Context in front end
    return response;
}

export function updateArtist(req: Request, res: Response, next: NextFunction) {
        return res.send();
}
