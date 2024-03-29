import {
    ArtCollections,
    FindCursor,
    InsertOneResult,
    MongoDB,
    ObjectId,
    Sort,
    UpdateOptions, UpdateResult, Document
} from "../adapters/database/MongoDB";
import {MongoDBEntity} from "../model/MongoDBEntity/MongoDBEntity";



export class MongoDBClient {

    mongoDB : MongoDB;

    constructor(mongoDB : MongoDB ) {
        this.mongoDB = mongoDB;
    }


    async getOneResource<T extends MongoDBEntity>(collectionName: ArtCollections, query : {}) : Promise<T | any>{
        try{
            let collection = await this.mongoDB.getCollection(collectionName);
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

    async addNewResource<T extends MongoDBEntity>(collectionName: ArtCollections, query : {}) : Promise<InsertOneResult> {
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        let response: InsertOneResult = await collection.insertOne(query);
        return response;
    }

    async getResources(collectionName: ArtCollections, query : {}, projection : Document | {}, sort: Sort, limit: number | undefined) : Promise<[] | any> {
        try{
            let collection = await this.mongoDB.getCollection(collectionName);
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            if(limit) {
                return await collection.find(query).project(projection).sort(sort).limit(limit).toArray() as [];
            }
            else {
                return await collection.find(query).project(projection).sort(sort).toArray() as [];
            }
        }
        catch (e) {
            console.log(e);
            return {};
        }

    }


    async getResourcesProjection(collectionName: ArtCollections, query : {}, document: Document ) : Promise<FindCursor>{
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        let entity = await collection.find(query).project(document);
        return entity;
    }

    async getDistinctResources(collectionName: ArtCollections, query : {}, document: Document ) : Promise<any>{
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        let entity = await collection.distinct("userName");
        return entity;
    }

    //const query1 = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};

    async getResourcePage(collectionName: ArtCollections, query : {$and: [{_id: {$gt: ObjectId}}, any]} |  any, pageSize: number, sort: any) : Promise<[]> {

        try{
            let collection = await this.mongoDB.getCollection(collectionName);
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

    async createResource<T>(collectionName: ArtCollections, resource : any) : Promise<InsertOneResult> {
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        return await collection.insertOne(resource);
    }

    async updateResource<T extends MongoDBEntity>(collectionName: ArtCollections, filter : any, update: any,
                                                  options : UpdateOptions) : Promise<UpdateResult> {
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        if(update.$set) {
            delete update.$set._id;
            delete update.$set.id;
        }
        console.log("preparing to update");
        return await collection.updateOne(filter, update, options);
    }

    async updateResources<T extends MongoDBEntity>(collectionName: ArtCollections, filter : any, update: any,
                                                  options : UpdateOptions) : Promise<UpdateResult | Document> {
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        delete update.$set._id;
        delete update.$set.id;
        return await collection.updateMany(filter, update, options);
    }

    async deleteOneResource(collectionName: ArtCollections, filter : any) {
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        return await collection.deleteOne(filter);
    }

    async deleteResources(collectionName: ArtCollections, filter : any) {
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        return await collection.deleteMany(filter);
    }

    async getResourceByPage(collectionName: ArtCollections, pageIndex: string, pageSize: number,
                               filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1 | 0}) {
        try{
            if(Object.keys(fields).length == 0){
                console.log(JSON.stringify(fields));
                fields.email = 0; // make this generic for all functions. never return password
                fields.password = 0; // make this generic for all functions. never return password
            }
            else {
                delete fields.email;
                delete fields.password;
            }
            console.log("fields: " + JSON.stringify(fields));
            let collection = await this.mongoDB.getCollection(collectionName);
            let entity : any[];
            if(collection == undefined) {
                console.error(collectionName + " collection missing");
                throw new Error(collectionName +" collection missing");
            }
            let id : ObjectId;
            if(pageIndex != "" && pageIndex != undefined && pageIndex != "0") {
                try{
                    id = new ObjectId(pageIndex);
                    console.log("getting resouces " + JSON.stringify(id));
                    if(searchText == "" || searchText == undefined) {
                        entity = await collection.find({$and: [{_id: {$lt: id}}, filterTerms]}, {projection: fields}).limit(pageSize).sort({ date: -1 }).toArray();
                    }
                    else {
                        entity = await collection.find({$and: [{_id: {$lt: id}}, filterTerms, { $text: { $search: searchText }}]}, {projection: fields}).limit(pageSize).sort({ _id: -1 }).toArray();
                    }
                }
                catch (e) {
                    console.error("bad page index " + pageIndex);
                    throw e;
                }
            }
            else{
                if(pageSize == undefined) {
                    pageSize = 14;
                }
                if(searchText == "" || searchText == undefined) {
                    return await collection.find(filterTerms, {projection: fields}).limit(pageSize).sort({ date: -1 }).toArray();
                }
                else {
                    return await collection.find({$and: [filterTerms, { $text: { $search: searchText }}]}, {projection: fields})
                        .limit(pageSize).sort({ date: -1 }).toArray();
                }
            }

            console.log("entity " + JSON.stringify(entity));
            return entity;
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getAggregateOneResource(collectionName: ArtCollections, from: ArtCollections | undefined, localField: string,
                                  foreignField: string, queryId: ObjectId | undefined, as: string, fields: {[key: string]: 1 | 0}, foreignProjection: {[key: string]: 1 | 0}) {
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        let id : ObjectId;
        let cursor = collection.aggregate([
            { $sort : { _id : -1 } },
            {$match: {_id : queryId}},
            {$lookup: {
                    from: from,
                    localField: localField,
                    foreignField: foreignField,
                    pipeline : [
                        {$project : foreignProjection} //TODO need to customize projection
                    ],
                    as: as
                }},
        ]);
        return await cursor.toArray();
    }

    async getAggregate(collectionName: ArtCollections, from: ArtCollections | undefined, localField: string,
                       foreignField: string, as: string, foreignProjection: string, indexField: any, indexValue: any, pageSize: number,
                       filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1 | 0}) {
        let collection = await this.mongoDB.getCollection(collectionName);
        let entity: any[];
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        console.log(pageSize)
        pageSize = pageSize ? pageSize : 10;
        if(from == undefined) {
            return await this.getResourceByPage(collectionName, indexValue, pageSize, filterTerms, searchText, fields);
        }
        if(foreignProjection == "password" || foreignProjection == "" || foreignProjection == undefined) {
            foreignProjection = "_id";
        }
        if(indexField == "_id") {
            try{
                indexValue = new ObjectId(indexValue);
            }
            catch (e) {
                console.error("bad page index " + indexValue);
                throw e;
            }
        }
        if(indexValue != "" && indexValue != undefined && indexValue != "0") {

            let cursor = collection.aggregate([
                { $sort : { [indexField] : -1 } },
                {$match: {
                        $and: [{[indexField]: {$lt: indexValue}}, filterTerms]
                    }},
                {$limit: pageSize
                },
                {$lookup: {
                    from: from,
                    localField: localField,
                    foreignField: foreignField,
                    pipeline : [
                        {$project : { [foreignProjection] : 1}} //TODO need to customize projection
                    ],
                    as: as
                }},
            ]);
            //cursor.sort({ _id : -1});
            return await cursor.toArray();
        }
        else {
            let cursor = collection.aggregate([
                { $sort : { [indexField] : -1 } },
                {$match: {
                        $and: [filterTerms]
                    }},
                {$limit: pageSize
                },
                {$lookup: {
                        from: from,
                        localField: localField,
                        foreignField: foreignField,
                        pipeline : [
                            {$project : { [foreignProjection] : 1}} //TODO need to customize projection
                        ],
                        as: as
                    }},
            ]);
            return await cursor.toArray();
        }
    }

    async getAggregateCustomLookup(collectionName: ArtCollections, indexField: any, indexValue: any, pageSize: number,
                       filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1 | 0}, lookup: any) {
        let collection = await this.mongoDB.getCollection(collectionName);
        if (collection == undefined) {
            console.error(collectionName + " collection missing");
            throw new Error(collectionName + " collection missing");
        }
        console.log(pageSize)
        pageSize = pageSize ? pageSize : 10;
        if(indexField == "_id") {
            try{
                indexValue = new ObjectId(indexValue);
            }
            catch (e) {
                console.error("bad page index " + indexValue);
                throw e;
            }
        }
        if(indexValue != "" && indexValue != undefined && indexValue != "0") {
            console.log("getting pictures");
            let cursor = collection.aggregate([
                { $sort : { [indexField] : -1 } },
                {$match: {
                        $and: [{[indexField]: {$lt: indexValue}}, filterTerms]
                    }},
                {$limit: pageSize
                },
                lookup,
            ]);
            //cursor.sort({ _id : -1});
            return await cursor.toArray();
        }
        else {
            let cursor = collection.aggregate([
                { $sort : { [indexField] : -1 } },
                {$match: {
                        $and: [filterTerms]
                    }},
                {$limit: pageSize
                },
                lookup,
            ]);
            return await cursor.toArray();
        }
    }


}