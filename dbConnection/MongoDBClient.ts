import {collections} from "./dbConn";
import {Artist, ArtistDB} from "../model/Artist";
import {MongoDBEntity} from "../model/MongoDBEntity/MongoDBEntity";
import * as mongoDB from "mongodb";
import {Document, FindCursor, FindOptions, InferIdType, InsertOneResult, ObjectId} from "mongodb";


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

    async getResources(collectionName: "pictures" | "artist" | "gallery", query : {}, findOptions : FindOptions | {}) : Promise<[] | any>{
        try{
            let collection = collections[collectionName];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            let entity : []= await collection.find(query, findOptions).toArray() as [];

            return entity;
        }
        catch (e) {
            console.log(e);
            return {};
        }
    }


    async getResourcesProjection(collectionName: "pictures" | "artist" | "gallery", query : {}, document: Document ) : Promise<FindCursor>{
        let collection = collections[collectionName];
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        let entity = await collection.find(query).project(document);
        return entity;
    }

    async getDistinctResources(collectionName: "pictures" | "artist" | "gallery", query : {}, document: Document ) : Promise<any>{
        let collection = collections[collectionName];
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        let entity = await collection.distinct("userName");
        return entity;
    }

    //const query1 = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};

    async getResourcePage(collectionName: "pictures" | "artist" | "gallery", query : {$and: [{_id: {$gt: ObjectId}}, any]} |  any, pageSize: number, sort: any) : Promise<[]> {

        try{
            let collection = collections[collectionName];
            let entity : [];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            entity = await collection.find(query).limit(pageSize).sort(sort).toArray() as [];
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

    async getResourceByPage(collectionName: "pictures" | "artist" | "gallery", pageIndex: string, pageSize: number,
                               filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1 | 0}) {
        try{
            let collection = collections[collectionName];
            let entity : any[];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            let id : mongoDB.ObjectId;
            console.log("filterTerms " + JSON.stringify(filterTerms));
            console.log("searchText " + JSON.stringify(searchText));
            console.log("fields " + JSON.stringify(fields));
            console.log("pageSize " + JSON.stringify(pageSize));
            if(pageIndex != "" && pageIndex != undefined) {
                try{
                    id = new ObjectId(pageIndex);
                    console.log("getting resouces " + JSON.stringify(id));
                    if(searchText == "" || searchText == undefined) {
                        entity = await collection.find({$and: [{_id: {$lt: id}}, filterTerms]}, fields).limit(pageSize).sort({ date: -1 }).toArray();
                    }
                    else {
                        entity = await collection.find({$and: [{_id: {$lt: id}}, filterTerms, { $text: { $search: searchText }}]}, fields).limit(pageSize).sort({ _id: -1 }).toArray();
                    }
                }
                catch (e) {
                    console.error("bad page index {}", pageIndex);
                    throw e;
                }
            }
            else{
                if(pageSize == undefined) {
                    pageSize = 100;
                }
                if(searchText == "" || searchText == undefined) {
                    entity = await collection.find(filterTerms, fields).limit(pageSize).sort({ date: -1 }).toArray();
                }
                else {
                    entity = await collection.find({$and: [filterTerms, { $text: { $search: searchText }}]}, fields)
                        .limit(pageSize).sort({ date: -1 }).toArray();
                }
                entity = await collection.find(filterTerms, fields).limit(pageSize).sort({ date: -1 }).toArray()
            }

            console.log("entity " + JSON.stringify(entity));
            return entity;
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }


}