import 'dotenv/config';
import {MongoDBConnection} from "./dbConnection/MongoDBConnection";
import express from "express";
import {publicPicturesRouter, protectedPicturesRouter} from "./router/api/pictures";
import {jwtRouter} from "./router/jwt";
import {publicArtistRouter, protectedArtistRouter} from "./router/api/artist";
import {registerRouter} from "./router/register";
import {publicChallengesRouter} from "./router/api/challenges";
import {logoutRouter} from "./router/logout";
import {refresh} from "./router/refresh";
import mongoSanitize from "express-mongo-sanitize";
let cors = require('cors')
const cookies = require("cookie-parser");
const port = process.env.PORT
const app = express();


if(process.env.OTHER_CORS && (process.env.OTHER_CORS != undefined || process.env.OTHER_CORS != "")) {
    let otherCors =  process.env.OTHER_CORS.split(",");
    //@ts-ignore
    app.use(cors({
        //@ts-ignore
        origin : [process.env.FRONT_END_HOST + process.env.FRONT_END_PORT, process.env.CLOUDFLARE_WORKER, ...otherCors],
        credentials: true,
    }));
}
else {
    app.use(cors({
        //@ts-ignore
        origin : [process.env.FRONT_END_HOST + process.env.FRONT_END_PORT, process.env.CLOUDFLARE_WORKER],
        credentials: true,
    }));
}


app.use(express.json());

app.use(cookies());
// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.query
// - req.params
// - req.headers

// To remove data using these defaults:
app.use(mongoSanitize());
app.use(require('sanitize').middleware);

app.get('/health', (req, res) => {
    res.status(200);
    return res.send({ status: "alive" });
});

app.use('/logout', logoutRouter);
app.use('/refresh', refresh);
app.use('/register', registerRouter);

// CRUD API
app.use('/pictures', publicPicturesRouter);
app.use('/artist', publicArtistRouter);
app.use('/challenges', publicChallengesRouter);

// authorization required
app.use(jwtRouter);
app.use('/pictures', protectedPicturesRouter);
app.use('/artist', protectedArtistRouter);



const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_CLUSTER}/?retryWrites=true&w=majority`;
//const uri= "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";

let connection = new MongoDBConnection();
connection.connectToDatabase(uri, {}, `${process.env.DATABASE}`)
    .then(() => {
        connection.initializeCollections().then(() => {
            app.listen(port, async () => {
                console.log(`Server started at http://localhost:${port}`);
            });
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });