import * as mongoDB from "mongodb";
import {Picture} from "../model/picture";

const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";

export const collections: { pictures?: mongoDB.Collection, artist?: mongoDB.Collection, gallery?: mongoDB.Collection } = {}

export async function connectToDatabase () {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(uri);

    await client.connect();

    const db: mongoDB.Db = client.db("Art");

    await configureIndexes(db);

    const artistCollection: mongoDB.Collection = db.collection("artist");
    collections.artist = artistCollection;
    const picturesCollection: mongoDB.Collection = db.collection("pictures");
    collections.pictures = picturesCollection;
    const galleryCollection: mongoDB.Collection = db.collection("gallery");
    collections.gallery = galleryCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${artistCollection.collectionName}`);
}

async function configureIndexes(db: mongoDB.Db) {
    const picturesCollection: mongoDB.Collection = db.collection("pictures");
    await picturesCollection.createIndex({ pictureName : "text", tags : "text", artistUsername: "text"}, { default_language: "english" });
    await picturesCollection.createIndex({ date : 1});
}