import {connectToDatabase} from "./dbConnection/dbConn";
import express, {NextFunction, Request, Response} from "express";
import sessions from "express-session";
import config from "./config/config";
import * as core from "express-serve-static-core";
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
app.use('/logout', require('./router/authentication'));
app.use('/login', require('./router/authentication'));
app.use('/refresh', require('./router/authentication'));
app.use('/artist', require('./router/api/artist'));
app.use('/file', require('./router/api/file'));
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