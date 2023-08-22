import * as mongoDB from "mongodb";
import {addWordsToDatabase} from "../drawingOftheDay/wordOftheDay";

let connection : mongoDB.MongoClient;
export const collections: { pictures?: mongoDB.Collection, artist?: mongoDB.Collection, words?: mongoDB.Collection } = {}

export async function connectToDatabase (uri : string, connectionOptions: mongoDB.MongoClientOptions, dbName: string) {

    connection = await mongoDB.MongoClient.connect(uri, connectionOptions);

    const db: mongoDB.Db = connection.db(dbName);

    await configureIndexes(db);
    await addWords();
    const artistCollection: mongoDB.Collection = db.collection("artist");
    collections.artist = artistCollection;
    const picturesCollection: mongoDB.Collection = db.collection("pictures");
    collections.pictures = picturesCollection;
    const wordsCollection: mongoDB.Collection = db.collection("words");
    collections.words = wordsCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${artistCollection.collectionName}`);
}

export async function closeConnection() {
    await connection.close();
}

async function configureIndexes(db: mongoDB.Db) {
    const picturesCollection: mongoDB.Collection = db.collection("pictures");
    await picturesCollection.createIndex({ pictureName : "text", tags : "text", artistUsername: "text"}, { default_language: "english" });
    await picturesCollection.createIndex({ date : 1});

    const artistCollection : mongoDB.Collection = db.collection("artist");
    await artistCollection.createIndex({ userName : 1}, { unique: true});
    await artistCollection.createIndex({ email : 1}, { unique: true});

    const wordsCollection : mongoDB.Collection = db.collection("words");
    await wordsCollection.createIndex({japanese: 1}, {unique: true});
}

async function addWords() {
    //@ts-ignore
    await addWordsToDatabase(process.env.CSV_WORDS_FILE, process.env.WORDS_START_DATE);

}