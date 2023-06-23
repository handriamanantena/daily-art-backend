import {collections, connectToDatabase} from "./dbConnection/dbConn";
import express, {NextFunction, Request, Response} from "express";
import sessions from "express-session";
import config from "./config/config";
import * as core from "express-serve-static-core";
import {publicPicturesRouter, protectedPicturesRouter} from "./router/api/pictures";
import {jwtRouter} from "./router/jwt";
import {publicArtistRouter, protectedArtistRouter} from "./router/api/artist";
const mongoSanitize = require('express-mongo-sanitize');
const authenticate  = require("./router/authenticate")
let cors = require('cors')
const cookies = require("cookie-parser");
const port = 3001
const app = express();
let fs = require('fs');
let http = require('http');
let https = require('https');
let privateKey  = fs.readFileSync(config.ssl.keyPath, 'utf8');
let certificate = fs.readFileSync(config.ssl.certPath, 'utf8');

app.use(cors({
    origin : config.host + ":3000",
    credentials: true,
}));
app.use(express.json());

/*let unless = (middleware : core.Router, paths : string[{path : string, method?: string}]) => {
    return function(req : Request, res : Response, next: NextFunction) {
        console.log("testing path " + req.path);
        const pathCheck = paths.some(path => {
            if(req.path.match(path.path) && path.method == req.method) {
                return false;
            }
        });
        pathCheck ? next() : middleware(req, res, next);
    };
}*/
/*app.use(unless(authenticate, [{path: "/login"}, {path: "/artist"}, {path: "\/pictures.*", method: "POST"}, {path: "\/file\/.*"},
    {path: "/refresh"}, {path: "/logout"}]));*/


//app.use("/", authenticate);


app.use(cookies())
// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.query
// - req.params
// - req.headers

// To remove data using these defaults:
app.use(mongoSanitize());
app.use(require('sanitize').middleware);


app.use('/logout', require('./router/logout'));
app.use('/refresh', require('./router/refresh'));
app.use('/file', require('./router/api/file'));
app.use('/register', require('./router/register'));

// CRUD API
app.use('/pictures', publicPicturesRouter);
app.use('/artist', publicArtistRouter); // TODO move to login

// authorization required
app.use(jwtRouter);
app.use('/pictures', protectedPicturesRouter);
app.use('/artist', protectedArtistRouter);


/*app.get('/testUniqueIndex', (async (req, resp, next) => {

    try{
        let artists = await collections.artist;
        if(artists == undefined) {
            console.error("artists collection missing");
            throw new Error("artists collection missing");
        }
        let test = await artists.createIndex({emails : "text"}, {unique : true});
        console.log(test);
        return resp.send(test);
    }
    catch (e) {
        console.log(e);
        return resp.send(e);
    }


}));*/
/*app.use('/comment', require('./router/api/pictures')); //TODO*/
let credentials = {key: privateKey, cert: certificate};
let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);


const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";

connectToDatabase(uri, {}, "Art")
    .then(() => {

        httpServer.listen(port, ()=> {
            console.log(`Server started at http://localhost:${port}`);
        });
        httpsServer.listen(443, ()=> {
            console.log(`Server started at https://localhost:${443}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });