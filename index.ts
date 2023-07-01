import {collections, connectToDatabase} from "./dbConnection/dbConn";
import express, {NextFunction, Request, Response} from "express";
import sessions from "express-session";
import * as core from "express-serve-static-core";
import {publicPicturesRouter, protectedPicturesRouter} from "./router/api/pictures";
import {jwtRouter} from "./router/jwt";
import {publicArtistRouter, protectedArtistRouter} from "./router/api/artist";
const mongoSanitize = require('express-mongo-sanitize');
const authenticate  = require("./router/authenticate")
let cors = require('cors')
const http = require('http')
const cookies = require("cookie-parser");
const port = 3001
const app = express();


app.use(cors({
    //@ts-ignore
    origin : [process.env.FRONT_END_HOST + process.env.FRONT_END_PORT, process.env.CLOUDFLARE_WORKER],
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


const uri =
    `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_CLUSTER}/?retryWrites=true&w=majority`;

connectToDatabase(uri, {}, "Art")
    .then(() => {

        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });