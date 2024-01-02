import {ObjectId} from "../../adapters/database/MongoDB";

export interface MongoDBEntity {
    _id: ObjectId;
}