import * as mongoDB from "mongodb";
import {Picture} from "../model/picture";
import {MongoDBClient} from "./MongoDBClient";

let connection : mongoDB.MongoClient;
export const collections: { pictures?: mongoDB.Collection, artist?: mongoDB.Collection, gallery?: mongoDB.Collection } = {}

export async function connectToDatabase (uri : string, connectionOptions: mongoDB.MongoClientOptions, dbName: string) {

    connection = await mongoDB.MongoClient.connect(uri, connectionOptions);

    const db: mongoDB.Db = connection.db(dbName);

    await configureIndexes(db);

    const artistCollection: mongoDB.Collection = db.collection("artist");
    collections.artist = artistCollection;
    const picturesCollection: mongoDB.Collection = db.collection("pictures");
    collections.pictures = picturesCollection;
    const galleryCollection: mongoDB.Collection = db.collection("gallery");
    collections.gallery = galleryCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${artistCollection.collectionName}`);
}

export async function closeConnection() {
    await connection.close();
}

async function configureIndexes(db: mongoDB.Db) {
    const picturesCollection: mongoDB.Collection = db.collection("pictures");
    await picturesCollection.createIndex({ pictureName : "text", tags : "text", artistUsername: "text"}, { default_language: "english" });
    await picturesCollection.createIndex({ date : 1});
}