import {collections} from "./dbConn";
import {Artist, ArtistDB} from "../model/Artist";
import {MongoDBEntity} from "../model/MongoDBEntity/MongoDBEntity";
import * as mongoDB from "mongodb";
import {InsertOneResult} from "mongodb";


export class MongoDBClient {



    async getOneResource<T extends MongoDBEntity>(collectionName: "pictures" | "artist" | "gallery", query : {}) : Promise<T | any>{
        try{
            let collection = collections[collectionName];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            let entity : T = await collection.findOne(query) as T

            return entity;
        }
        catch (e) {
            console.log(e);
            return {};
        }
    }

    async addNewResource<T extends MongoDBEntity>(collectionName: "pictures" | "artist" | "gallery", query : {}) : Promise<InsertOneResult | any> {
        try{
            let collection = collections[collectionName];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            let response : InsertOneResult = await collection.insertOne(query);
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }

    private logMissingCollection(collection: mongoDB.MongoClient, collectionName: "pictures" | "artist" | "gallery") {
        if(collection == undefined) {
            console.error(collection + " collection missing");
            throw new Error(collectionName +" collection missing");
        }
    }


}