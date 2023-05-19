import {collections} from "./dbConn";
import {Artist, ArtistDB} from "../model/Artist";
import {MongoDBEntity} from "../model/MongoDBEntity/MongoDBEntity";
import * as mongoDB from "mongodb";
import {Document, FindOptions, InferIdType, InsertOneResult, ObjectId} from "mongodb";


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

    async getResources<T>(collectionName: "pictures" | "artist" | "gallery", query : {}, findOptions : FindOptions | {}) : Promise<T[] | any>{
        try{
            let collection = collections[collectionName];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            let entity : T[]= await collection.find(query, findOptions).toArray() as T[];

            return entity;
        }
        catch (e) {
            console.log(e);
            return {};
        }
    }


    async getResourcesProject<T>(collectionName: "pictures" | "artist" | "gallery", query : {}, document : Document | {}) : Promise<T[] | any>{
        try{
            let collection = collections[collectionName];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            let entity : T[]= await collection.find(query).project(document).toArray() as T[];

            return entity;
        }
        catch (e) {
            console.log(e);
            return {};
        }
    }

    //const query1 = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};

    async getResourcePage<T>(collectionName: "pictures" | "artist" | "gallery", query : {$and: [{_id: {$gt: ObjectId}}, any]} |  any, pageSize: number, sort: any) : Promise<T[]> {

        try{
            let collection = collections[collectionName];
            let entity : T[];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            entity = await collection.find(query).limit(pageSize).sort(sort).toArray() as T[];
            return entity;
        }
        catch (e) {
            console.log(e);
            return [];
        }
    }

    async createResource<T>(collectionName: "pictures" | "artist" | "gallery", resource : MongoDBEntity) : Promise<InsertOneResult> {
        let collection = collections[collectionName];
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        return await collection.insertOne(resource);
    }

    private logMissingCollection(collection: mongoDB.MongoClient, collectionName: "pictures" | "artist" | "gallery") {
        if(collection == undefined) {
            console.error(collection + " collection missing");
            throw new Error(collectionName +" collection missing");
        }
    }


}