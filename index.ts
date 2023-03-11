import {collections, connectToDatabase} from "./dbConnection/dbConn";
import express, {NextFunction, Request, Response} from "express";
import sessions from "express-session";
import config from "./config/config";
import * as core from "express-serve-static-core";
import {registerRouter} from "./router/testUniqueIndex";
const authenticate  = require("./router/authenticate")
let cors = require('cors')
const cookies = require("cookie-parser");
const port = 3001
const app = express()

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
//app.use(unless(authenticate, ["/login", "/artist", "\/pictures.*", "\/file\/.*", "/refresh", "/logout"]));


//app.use("/", authenticate);


app.use(cookies())

app.use('/pictures', require('./router/api/pictures'));
app.use('/logout', require('./router/logout'));
app.use('/jwt', require('./router/jwt'));
app.use('/refresh', require('./router/authentication'));
app.use('/artist', require('./router/api/artist'));
app.use('/file', require('./router/api/file'));
app.use('/register', require('./router/register'));
app.get('/testUniqueIndex', (async (req, resp, next) => {

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


}));
/*app.use('/comment', require('./router/api/pictures')); //TODO*/


connectToDatabase()
    .then(() => {

        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });