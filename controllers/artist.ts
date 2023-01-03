import {NextFunction, Request, Response} from "express";
import {Artist} from "../model/Artist";
import jwt from "jsonwebtoken";
import config from "../config/config";
import {GoogleLogin} from "../authentication/googleLogin";
import {ArtistMongodb} from "../authentication/artistmongodb";
const googleLogin = new GoogleLogin();
const loginClient = new ArtistMongodb();


export async function addArtist (req: Request, res: Response, next: NextFunction) {
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
                let artist = await loginClient.getArtistByEmail(googleAccount.email) as Artist
                delete artist['password'];
                //session.artist = artist;
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
}