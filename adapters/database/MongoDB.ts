import * as mongoDB from "mongodb";
import {DatabaseConnection} from "./DatabaseConnection";
import {IndexSpecification, InferIdType} from "mongodb";
import {CreateIndexesOptions} from "mongodb";



export interface MongoDBConnectionOptions {

}

export interface InsertOneResult extends mongoDB.InsertOneResult {}
export type Sort = mongoDB.Sort;
export class FindCursor extends mongoDB.FindCursor {}
export class ObjectId extends mongoDB.ObjectId {}
export interface UpdateOptions extends mongoDB.UpdateOptions {}
export interface UpdateResult extends mongoDB.UpdateResult {}
export interface Document extends mongoDB.Document {}


export type ArtCollections = "pictures" | "artist" | "challenges";


export class MongoDB extends DatabaseConnection {

    async connectToDatabase(uri: string, connectionOptions: mongoDB.MongoClientOptions, dbName: string) : Promise<void> {
        this.connection = await mongoDB.MongoClient.connect(uri, connectionOptions) ;
        this.database = (this.connection as mongoDB.MongoClient).db(dbName);
        console.log(`Successfully connected to database: ${(this.database as mongoDB.Db).databaseName}`);
    }

    async closeConnection() {
        await (this.connection as mongoDB.MongoClient).close();
    }


    async createIndex(collectionName: string, indexSpec: IndexSpecification, options?: CreateIndexesOptions) : Promise<void>{
        const collection = (this.database as mongoDB.Db).collection(collectionName);
        if(options == undefined) {
            await collection.createIndex(indexSpec);
        }
        else {
            await collection.createIndex(indexSpec, options);
        }
    }

    async getCollection(collectionName: ArtCollections) : Promise<mongoDB.Collection> {
        return (this.database as mongoDB.Db).collection(collectionName);
    }

}